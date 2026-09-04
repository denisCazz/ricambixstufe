import https from "node:https";
import {
  createHash,
  createPrivateKey,
  createSign,
  type KeyObject,
} from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, orderItems } from "@/db/schema";
import {
  sendOrderConfirmationEmail,
  sendNewOrderAdminNotification,
} from "@/lib/email";

const LIVE_HOST = "authservices.satispay.com";
const SANDBOX_HOST = "staging.authservices.satispay.com";

export class SatispayError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "missing_credentials"
      | "invalid_key"
      | "auth_failed"
      | "create_failed"
      | "get_failed"
      | "no_redirect_url",
    public readonly status?: number,
    public readonly details?: string
  ) {
    super(message);
    this.name = "SatispayError";
  }
}

export type SatispayPaymentStatus =
  | "PENDING"
  | "ACCEPTED"
  | "CANCELED"
  | "AUTHORIZED";

export interface SatispayPayment {
  id: string;
  status: SatispayPaymentStatus;
  amount_unit: number;
  currency: string;
  redirect_url?: string;
  expired?: boolean;
  metadata?: Record<string, string>;
  external_code?: string;
}

export type SatispayFulfillOutcome =
  | "confirmed"
  | "already_confirmed"
  | "pending"
  | "canceled"
  | "mismatch"
  | "not_found";

function isLive(): boolean {
  return process.env.SATISPAY_MODE === "live";
}

function getHost(): string {
  return isLive() ? LIVE_HOST : SANDBOX_HOST;
}

function getKeyId(): string {
  const keyId = process.env.SATISPAY_KEY_ID?.trim();
  if (!keyId) {
    throw new SatispayError(
      "Satispay credentials not configured (SATISPAY_KEY_ID)",
      "missing_credentials"
    );
  }
  return keyId;
}

/**
 * Coolify / Docker often mangle multiline PEM (quotes, literal `\n`,
 * collapsed newlines, unwrapped base64). OpenSSL 3 on Alpine then fails with
 * `error:1E08010C:DECODER routines::unsupported`.
 */
function normalizePrivateKeyPem(raw: string): string {
  let key = raw.trim().replace(/^\uFEFF/, "");
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  key = key.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\\n/g, "\n");

  const match = key.match(
    /-----BEGIN ([A-Z0-9 ]+KEY)-----([\s\S]*?)-----END \1-----/
  );
  if (!match) {
    throw new Error("PEM BEGIN/END markers missing or truncated");
  }

  const type = match[1];
  const body = match[2].replace(/[^A-Za-z0-9+/=]/g, "");
  if (body.length < 256) {
    throw new Error(`PEM body too short (${body.length} chars)`);
  }

  const wrapped = body.match(/.{1,64}/g)?.join("\n") ?? body;
  return `-----BEGIN ${type}-----\n${wrapped}\n-----END ${type}-----\n`;
}

function getPrivateKey(): KeyObject {
  const raw = process.env.SATISPAY_PRIVATE_KEY;
  if (!raw?.trim()) {
    throw new SatispayError(
      "Satispay credentials not configured (SATISPAY_PRIVATE_KEY)",
      "missing_credentials"
    );
  }
  try {
    return createPrivateKey(normalizePrivateKeyPem(raw));
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    console.error("Satispay private key parse failed:", details);
    throw new SatispayError(
      "SATISPAY_PRIVATE_KEY non è una PEM RSA valida. In Coolify incollala su una sola riga, con \\n al posto dei ritorni a capo, senza virgolette extra.",
      "invalid_key",
      undefined,
      details
    );
  }
}

function createDigest(body: string): string {
  const hash = createHash("sha256").update(body, "utf8").digest("base64");
  return `SHA-256=${hash}`;
}

function signMessage(message: string, key: KeyObject): string {
  const sign = createSign("RSA-SHA256");
  sign.update(message, "utf8");
  sign.end();
  return sign.sign(key, "base64");
}

function httpsJson(opts: {
  method: "GET" | "POST";
  path: string;
  body?: string;
}): Promise<{ status: number; body: string }> {
  const host = getHost();
  const keyId = getKeyId();
  const privateKey = getPrivateKey();
  const body = opts.body ?? "";
  const digest = createDigest(body);
  const date = new Date().toUTCString();
  const requestTarget = `${opts.method.toLowerCase()} ${opts.path}`;
  const message =
    `(request-target): ${requestTarget}\n` +
    `host: ${host}\n` +
    `date: ${date}\n` +
    `digest: ${digest}`;
  const signature = signMessage(message, privateKey);
  const authorization =
    `Signature keyId="${keyId}", algorithm="rsa-sha256", ` +
    `headers="(request-target) host date digest", signature="${signature}"`;

  const headers: Record<string, string> = {
    Host: host,
    Date: date,
    Digest: digest,
    Authorization: authorization,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (body) {
    headers["Content-Length"] = String(Buffer.byteLength(body, "utf8"));
  }

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        path: opts.path,
        method: opts.method,
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk as Buffer));
        res.on("end", () =>
          resolve({
            status: res.statusCode || 0,
            body: Buffer.concat(chunks).toString("utf8"),
          })
        );
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function parsePayment(raw: string): SatispayPayment {
  const data = JSON.parse(raw) as SatispayPayment;
  if (!data?.id || !data.status) {
    throw new Error("Satispay: risposta pagamento non valida");
  }
  return data;
}

export async function createSatispayPayment(params: {
  amountEur: number;
  orderId: number;
  callbackUrl: string;
  redirectUrl: string;
  externalCode: string;
}): Promise<{ paymentId: string; redirectUrl: string }> {
  const amountUnit = Math.round(params.amountEur * 100);
  const body = JSON.stringify({
    flow: "MATCH_CODE",
    amount_unit: amountUnit,
    currency: "EUR",
    external_code: params.externalCode,
    callback_url: params.callbackUrl,
    redirect_url: params.redirectUrl,
    metadata: {
      order_id: String(params.orderId),
    },
  });

  let res: { status: number; body: string };
  try {
    res = await httpsJson({
      method: "POST",
      path: "/g_business/v1/payments",
      body,
    });
  } catch (err) {
    if (err instanceof SatispayError) throw err;
    console.error("Satispay create payment network error:", err);
    throw new SatispayError("Satispay create payment failed", "create_failed");
  }

  if (res.status === 401 || res.status === 403) {
    console.error("Satispay authentication failed:", res.status, res.body.slice(0, 500));
    throw new SatispayError(
      "Satispay authentication failed — verifica KEY_ID / chiave privata e SATISPAY_MODE",
      "auth_failed",
      res.status,
      res.body.slice(0, 500)
    );
  }

  if (res.status < 200 || res.status >= 300) {
    console.error("Satispay create payment failed:", res.status, res.body.slice(0, 500));
    throw new SatispayError(
      "Satispay create payment failed",
      "create_failed",
      res.status,
      res.body.slice(0, 500)
    );
  }

  const payment = parsePayment(res.body);
  if (!payment.redirect_url) {
    throw new SatispayError(
      "Satispay: no redirect URL returned",
      "no_redirect_url"
    );
  }

  return { paymentId: payment.id, redirectUrl: payment.redirect_url };
}

export async function getSatispayPayment(
  paymentId: string
): Promise<SatispayPayment> {
  const path = `/g_business/v1/payments/${encodeURIComponent(paymentId)}`;
  let res: { status: number; body: string };
  try {
    res = await httpsJson({ method: "GET", path });
  } catch (err) {
    if (err instanceof SatispayError) throw err;
    console.error("Satispay get payment network error:", err);
    throw new SatispayError("Satispay get payment failed", "get_failed");
  }

  if (res.status === 401 || res.status === 403) {
    throw new SatispayError(
      "Satispay authentication failed",
      "auth_failed",
      res.status,
      res.body.slice(0, 500)
    );
  }

  if (res.status < 200 || res.status >= 300) {
    console.error("Satispay get payment failed:", res.status, res.body.slice(0, 500));
    throw new SatispayError(
      "Satispay get payment failed",
      "get_failed",
      res.status,
      res.body.slice(0, 500)
    );
  }

  return parsePayment(res.body);
}

export async function waitForSatispayPayment(
  paymentId: string,
  attempts = 8,
  delayMs = 700
): Promise<SatispayPayment> {
  let payment = await getSatispayPayment(paymentId);
  for (let i = 0; i < attempts - 1 && payment.status === "PENDING"; i++) {
    await new Promise((r) => setTimeout(r, delayMs));
    payment = await getSatispayPayment(paymentId);
  }
  return payment;
}

/** Diagnostic helper: signed GET without creating a payment. */
export async function verifySatispayCredentials(): Promise<{
  ok: boolean;
  mode: "live" | "sandbox";
  message: string;
}> {
  const mode = isLive() ? "live" : "sandbox";
  try {
    getKeyId();
    getPrivateKey();
  } catch (err) {
    if (err instanceof SatispayError && err.code === "missing_credentials") {
      return {
        ok: false,
        mode,
        message: `Credenziali mancanti (modalità ${mode}): imposta SATISPAY_KEY_ID e SATISPAY_PRIVATE_KEY`,
      };
    }
    if (err instanceof SatispayError && err.code === "invalid_key") {
      return {
        ok: false,
        mode,
        message: err.message,
      };
    }
    throw err;
  }

  try {
    const res = await httpsJson({
      method: "GET",
      path: "/g_business/v1/payments",
    });
    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        mode,
        message:
          `Autenticazione fallita (modalità ${mode}, HTTP ${res.status}). ` +
          `Verifica KeyId, chiave privata PEM e che SATISPAY_MODE corrisponda all'ambiente del KeyId.`,
      };
    }
    if (res.status < 500) {
      return {
        ok: true,
        mode,
        message: `Autenticazione Satispay OK (modalità ${mode})`,
      };
    }
    return {
      ok: false,
      mode,
      message: `Risposta inattesa da Satispay (modalità ${mode}, HTTP ${res.status})`,
    };
  } catch (err) {
    return {
      ok: false,
      mode,
      message: err instanceof Error ? err.message : "Errore di rete Satispay",
    };
  }
}

function pendingStatus(paymentId: string): string {
  return `satispay_pending:${paymentId}`;
}

function paidStatus(paymentId: string): string {
  return `satispay:${paymentId}`;
}

export async function cancelStalePendingSatispayOrders(opts: {
  userId?: string | null;
  guestEmail?: string | null;
}): Promise<void> {
  const db = getDb();
  const owner = opts.userId
    ? eq(orders.userId, opts.userId)
    : opts.guestEmail?.trim()
      ? eq(orders.guestEmail, opts.guestEmail.trim())
      : null;
  if (!owner) return;

  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        owner,
        eq(orders.status, "pending"),
        eq(orders.paymentMethod, "satispay")
      )
    );
}

export async function abandonPendingSatispayOrder(orderId: number): Promise<void> {
  const db = getDb();
  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.status, "pending"),
        eq(orders.paymentMethod, "satispay")
      )
    );
}

export function parseSatispayPaymentId(
  paymentStatus: string | null | undefined
): string | null {
  if (!paymentStatus) return null;
  const match = paymentStatus.match(/^satispay(?:_pending)?:(.+)$/);
  return match?.[1] ?? null;
}

export async function fulfillSatispayPayment(
  paymentId: string,
  expectedOrderId?: number
): Promise<{ outcome: SatispayFulfillOutcome; orderId?: number }> {
  const payment = await getSatispayPayment(paymentId);
  const db = getDb();
  const pending = pendingStatus(paymentId);
  const paid = paidStatus(paymentId);

  const byStatus = await db
    .select()
    .from(orders)
    .where(
      or(eq(orders.paymentStatus, pending), eq(orders.paymentStatus, paid))
    )
    .limit(1)
    .then((r) => r[0]);

  let order = byStatus;
  if (!order && payment.metadata?.order_id) {
    const metaId = Number(payment.metadata.order_id);
    if (Number.isFinite(metaId)) {
      order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, metaId))
        .limit(1)
        .then((r) => r[0]);
    }
  }

  if (!order) {
    console.error("Satispay: ordine non trovato per payment", paymentId);
    return { outcome: "not_found" };
  }

  if (order.paymentMethod !== "satispay") {
    console.error("Satispay: ordine", order.id, "non è un pagamento Satispay");
    return { outcome: "mismatch", orderId: order.id };
  }

  if (expectedOrderId != null && order.id !== expectedOrderId) {
    console.error(
      "Satispay: order_id mismatch",
      expectedOrderId,
      "vs",
      order.id,
      "payment",
      paymentId
    );
    return { outcome: "mismatch", orderId: order.id };
  }

  if (payment.status === "CANCELED") {
    if (order.status === "pending") {
      await db
        .update(orders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(
          and(eq(orders.id, order.id), eq(orders.status, "pending"))
        );
    }
    return { outcome: "canceled", orderId: order.id };
  }

  if (payment.status !== "ACCEPTED") {
    return { outcome: "pending", orderId: order.id };
  }

  const expectedCents = Math.round(Number(order.total) * 100);
  if (payment.amount_unit !== expectedCents) {
    console.error(
      "CRITICAL: Satispay amount mismatch",
      { paymentId, orderId: order.id, expectedCents, got: payment.amount_unit }
    );
    return { outcome: "mismatch", orderId: order.id };
  }

  if (order.paymentStatus === paid) {
    return { outcome: "already_confirmed", orderId: order.id };
  }

  const updated = await db
    .update(orders)
    .set({
      status: "confirmed",
      paymentStatus: paid,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(orders.id, order.id),
        or(eq(orders.status, "pending"), eq(orders.status, "cancelled")),
        or(
          eq(orders.paymentStatus, pending),
          eq(orders.paymentStatus, "satispay_pending")
        )
      )
    )
    .returning({ id: orders.id });

  if (!updated[0]) {
    return { outcome: "already_confirmed", orderId: order.id };
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const shipping = (order.shippingAddress || {}) as Record<string, string>;
  const billing = (order.billingAddress || {}) as Record<string, string>;

  const emailData = {
    orderId: order.id,
    customerEmail: billing.email || order.guestEmail || "",
    customerName: shipping.name || "",
    items: items.map((i) => ({
      product_name: i.productName,
      product_sku: i.productSku || null,
      quantity: i.quantity,
      unit_price: Number(i.unitPrice),
      discount_percent: i.discountPercent,
      line_total: Number(i.lineTotal),
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    paymentMethod: "satispay" as const,
    shippingAddress: shipping,
    billingInfo: billing,
  };

  await Promise.allSettled([
    sendOrderConfirmationEmail(emailData),
    sendNewOrderAdminNotification(emailData),
  ]);

  return { outcome: "confirmed", orderId: order.id };
}
