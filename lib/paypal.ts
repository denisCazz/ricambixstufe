/**
 * Explicit `PAYPAL_MODE=live|sandbox` wins.
 * If unset: production → live, otherwise sandbox (avoids Live credentials hitting sandbox → HTTP 401).
 */
export function getPayPalMode(): "live" | "sandbox" {
  const raw = (process.env.PAYPAL_MODE || "").trim().toLowerCase();
  if (raw === "live") return "live";
  if (raw === "sandbox") return "sandbox";
  return process.env.NODE_ENV === "production" ? "live" : "sandbox";
}

function getPayPalApiBase(): string {
  return getPayPalMode() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export class PayPalError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "missing_credentials"
      | "auth_failed"
      | "create_failed"
      | "capture_failed"
      | "no_approval_url",
    public readonly status?: number,
    public readonly details?: string
  ) {
    super(message);
    this.name = "PayPalError";
  }
}

async function readErrorBody(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text.slice(0, 500);
  } catch {
    return "";
  }
}

/** OAuth client-credentials — used by checkout and admin diagnostics. */
export async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new PayPalError(
      "PayPal credentials not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)",
      "missing_credentials"
    );
  }
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    const details = await readErrorBody(res);
    console.error("PayPal authentication failed:", res.status, details);
    throw new PayPalError(
      "PayPal authentication failed — verifica Client ID/Secret e PAYPAL_MODE",
      "auth_failed",
      res.status,
      details
    );
  }
  const data = await res.json();
  return data.access_token as string;
}

/** Diagnostic helper: mode + whether OAuth succeeds (no order created). */
export async function verifyPayPalCredentials(): Promise<{
  ok: boolean;
  mode: "live" | "sandbox";
  message: string;
}> {
  const mode = getPayPalMode();
  const modeEnv = (process.env.PAYPAL_MODE || "").trim() || "(non impostato)";
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const authUrl = process.env.AUTH_URL || "(non impostato → fallback localhost)";
  const idHint = clientId
    ? `${clientId.slice(0, 6)}…${clientId.slice(-4)}`
    : "assente";

  try {
    await getAccessToken();
    const liveWarning =
      mode === "sandbox"
        ? " ATTENZIONE: stai in sandbox — in produzione imposta PAYPAL_MODE=live e usa le credenziali Live."
        : "";
    return {
      ok: true,
      mode,
      message: `Autenticazione PayPal OK (modalità effettiva ${mode}, PAYPAL_MODE=${modeEnv}, Client ID ${idHint}, AUTH_URL=${authUrl}).${liveWarning}`,
    };
  } catch (err) {
    if (err instanceof PayPalError) {
      const mismatchHint =
        err.code === "auth_failed" && err.status === 401
          ? mode === "sandbox"
            ? ` HTTP 401 in sandbox: quasi sempre stai usando Client ID/Secret Live. Imposta PAYPAL_MODE=live nel .env del server e riavvia, oppure usa le credenziali Sandbox.`
            : ` HTTP 401 in live: usa le credenziali del tab Live su developer.paypal.com (non Sandbox) e verifica Client Secret.`
          : "";
      return {
        ok: false,
        mode,
        message:
          err.code === "missing_credentials"
            ? `Credenziali mancanti (modalità ${mode}): imposta PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET. AUTH_URL=${authUrl}`
            : `Autenticazione fallita (modalità effettiva ${mode}, PAYPAL_MODE=${modeEnv}, Client ID ${idHint}, HTTP ${err.status ?? "?"}).${mismatchHint} AUTH_URL=${authUrl}`,
      };
    }
    return {
      ok: false,
      mode,
      message: err instanceof Error ? err.message : "Errore sconosciuto",
    };
  }
}

export async function createPayPalOrder(params: {
  totalEur: number;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approvalUrl: string }> {
  const token = await getAccessToken();
  const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: params.totalEur.toFixed(2),
          },
          description: "RicambiXStufe",
        },
      ],
      application_context: {
        brand_name: "RicambiXStufe",
        locale: "it-IT",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });
  if (!res.ok) {
    const details = await readErrorBody(res);
    console.error("PayPal create order failed:", res.status, details);
    throw new PayPalError(
      "PayPal create order failed",
      "create_failed",
      res.status,
      details
    );
  }
  const data = await res.json();
  const approvalUrl = data.links?.find(
    (l: { rel: string; href: string }) => l.rel === "approve"
  )?.href;
  if (!approvalUrl) {
    throw new PayPalError(
      "PayPal: no approval URL returned",
      "no_approval_url"
    );
  }
  return { id: data.id as string, approvalUrl };
}

export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  status: string;
  captureId: string;
  payerEmail: string;
}> {
  const token = await getAccessToken();
  const res = await fetch(
    `${getPayPalApiBase()}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    const details = await readErrorBody(res);
    console.error("PayPal capture failed:", res.status, details);
    throw new PayPalError(
      "PayPal capture failed",
      "capture_failed",
      res.status,
      details
    );
  }
  const data = await res.json();
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status: data.status as string,
    captureId: capture?.id || "",
    payerEmail: data.payer?.email_address || "",
  };
}
