import { Resend } from "resend";
import { formatOrderNumber } from "@/lib/order-number";
import { te } from "@/lib/email-i18n";
import { resolveEmailLocale } from "@/lib/user-locale";
import type { Locale } from "@/lib/i18n";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "RicambiXStufe <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@ricambixstufe.it";
/** Recipient for order and dealer notifications (business operational email) */
const ORDERS_EMAIL = process.env.ORDERS_EMAIL || ADMIN_EMAIL;

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmailList(env: string | undefined): string[] {
  if (!env?.trim()) return [];
  return env
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e && EMAIL_RE.test(e));
}

const EMAIL_CC = parseEmailList(process.env.EMAIL_CC);
const EMAIL_BCC = parseEmailList(process.env.EMAIL_BCC);

function numberLocale(locale: Locale): string {
  if (locale === "en") return "en-GB";
  if (locale === "fr") return "fr-FR";
  if (locale === "es") return "es-ES";
  return "it-IT";
}

function formatEur(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(numberLocale(locale), {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function greeting(locale: Locale, name?: string | null): string {
  const hello = te(locale, "email.hello");
  if (!name) return `${hello},`;
  return `${hello} <strong>${escapeHtml(name)}</strong>,`;
}

// ============================================================
// ORDER EMAILS
// ============================================================

interface OrderItem {
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  line_total: number;
}

interface OrderEmailData {
  orderId: number;
  customerEmail: string;
  customerName: string;
  receiptUploadUrl?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    name?: string;
    address?: string;
    city?: string;
    zip?: string;
    province?: string;
    country?: string;
    locale?: string;
  };
  billingInfo?: {
    company?: string;
    vat_number?: string;
    sdi_code?: string;
    pec?: string;
  };
  locale?: string | null;
}

function localeForOrderEmail(data: OrderEmailData): Locale {
  return resolveEmailLocale({
    locales: [data.locale, data.shippingAddress?.locale],
    countries: [data.shippingAddress?.country],
  });
}

function getPaymentLabel(method: string, locale: Locale): string {
  const key =
    method === "paypal"
      ? "email.payment.paypal"
      : method === "satispay"
        ? "email.payment.satispay"
        : method === "bank_transfer"
          ? "email.payment.bank_transfer"
          : method === "cod"
            ? "email.payment.cod"
            : null;
  return key ? te(locale, key) : method;
}

function buildItemsTable(items: OrderItem[], locale: Locale): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
          ${escapeHtml(item.product_name)}${item.product_sku ? ` <span style="color:#9ca3af">(${escapeHtml(item.product_sku)})</span>` : ""}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px;">${formatEur(item.unit_price, locale)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px; font-weight: 600;">${formatEur(item.line_total, locale)}</td>
      </tr>`
    )
    .join("");

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb;">${te(locale, "email.order.col_product")}</th>
          <th style="padding: 8px 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb;">${te(locale, "email.order.col_qty")}</th>
          <th style="padding: 8px 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb;">${te(locale, "email.order.col_price")}</th>
          <th style="padding: 8px 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb;">${te(locale, "email.order.col_total")}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function bankTransferNote(locale: Locale, orderNumber: string): string {
  return `
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: 600; color: #92400e;">${te(locale, "email.order.bank_title")}</p>
      <p style="margin: 0; font-size: 14px; color: #78350f;">
        ${te(locale, "email.order.iban")}: <strong>IT76S0708461620000000920491</strong><br/>
        ${te(locale, "email.order.account_holder")}: RicambiXStufe<br/>
        ${te(locale, "email.order.reference")}: ${te(locale, "email.order.reference_value", { orderNumber })}
      </p>
    </div>`;
}

/** Send order confirmation email to customer */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const locale = localeForOrderEmail(data);
  const paymentLabel = getPaymentLabel(data.paymentMethod, locale);
  const addr = data.shippingAddress;
  const orderNumber = formatOrderNumber(data.orderId);

  let paymentNote = "";
  if (data.paymentMethod === "bank_transfer") {
    paymentNote = bankTransferNote(locale, orderNumber);
    if (data.receiptUploadUrl) {
      paymentNote += `
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #1e3a8a;">${te(locale, "email.order.receipt_text")}</p>
      <a href="${escapeHtml(data.receiptUploadUrl)}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">${te(locale, "email.order.receipt_button")}</a>
    </div>`;
    }
  } else if (data.paymentMethod === "cod") {
    paymentNote = `<p style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; font-size: 14px; color: #166534; margin: 16px 0;">${te(locale, "email.order.cod_note")}</p>`;
  }

  const billingHtml = data.billingInfo?.company
    ? `<p style="margin: 8px 0 0; font-size: 13px; color: #6b7280;">
        ${te(locale, "email.order.billing")}: ${escapeHtml(data.billingInfo.company)}${data.billingInfo.vat_number ? ` — ${te(locale, "email.order.vat")} ${escapeHtml(data.billingInfo.vat_number)}` : ""}${data.billingInfo.sdi_code ? ` — ${te(locale, "email.order.sdi")} ${escapeHtml(data.billingInfo.sdi_code)}` : ""}
      </p>`
    : "";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      ...(EMAIL_CC.length ? { cc: EMAIL_CC } : {}),
      ...(EMAIL_BCC.length ? { bcc: EMAIL_BCC } : {}),
      subject: te(locale, "email.order.subject", { orderNumber }),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 20px;">${te(locale, "email.order.title")}</h1>
            <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">${te(locale, "email.order.number", { orderNumber })}</p>
          </div>

          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>${greeting(locale, data.customerName)}</p>
            <p>${te(locale, "email.order.thanks")}</p>

            ${buildItemsTable(data.items, locale)}

            <table style="width: 100%; margin-top: 8px;">
              <tr><td style="padding: 4px 12px; font-size: 14px; color: #6b7280;">${te(locale, "email.order.subtotal")}</td><td style="padding: 4px 12px; text-align: right; font-size: 14px;">${formatEur(data.subtotal, locale)}</td></tr>
              <tr><td style="padding: 4px 12px; font-size: 14px; color: #6b7280;">${te(locale, "email.order.shipping")}</td><td style="padding: 4px 12px; text-align: right; font-size: 14px;">${formatEur(data.shippingCost, locale)}</td></tr>
              <tr><td style="padding: 8px 12px; font-size: 16px; font-weight: 700; border-top: 2px solid #e5e7eb;">${te(locale, "email.order.total")}</td><td style="padding: 8px 12px; text-align: right; font-size: 16px; font-weight: 700; border-top: 2px solid #e5e7eb; color: #b45309;">${formatEur(data.total, locale)}</td></tr>
            </table>

            <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 8px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;"><strong>${te(locale, "email.order.payment")}:</strong> ${paymentLabel}</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;"><strong>${te(locale, "email.order.shipping")}:</strong> ${escapeHtml(addr?.name || "")}, ${escapeHtml(addr?.address || "")}, ${escapeHtml(addr?.zip || "")} ${escapeHtml(addr?.city || "")} ${escapeHtml(addr?.province || "")} ${escapeHtml(addr?.country || "")}</p>
              ${billingHtml}
            </div>

            ${paymentNote}

            <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">
              ${te(locale, "email.order.tracking_soon")}
            </p>

            <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">${te(locale, "email.team")}</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}

// ============================================================
// ORDER STATUS UPDATE EMAIL
// ============================================================

const STATUS_META: Record<string, { emoji: string; color: string }> = {
  pending: { emoji: "⏳", color: "#d97706" },
  confirmed: { emoji: "✅", color: "#2563eb" },
  processing: { emoji: "🔧", color: "#4f46e5" },
  shipped: { emoji: "🚚", color: "#7c3aed" },
  delivered: { emoji: "📦", color: "#16a34a" },
  cancelled: { emoji: "❌", color: "#dc2626" },
};

export async function sendOrderStatusUpdateEmail({
  orderId,
  customerEmail,
  customerName,
  status,
  trackingNumber,
  locale: localeInput,
  country,
}: {
  orderId: number;
  customerEmail: string;
  customerName: string;
  status: string;
  trackingNumber?: string | null;
  locale?: string | null;
  country?: string | null;
}) {
  const meta = STATUS_META[status];
  if (!meta) return; // unknown status, skip

  const locale = resolveEmailLocale({
    locales: [localeInput],
    countries: [country],
  });
  const label = te(locale, `email.status.${status}.label`);
  const message = te(locale, `email.status.${status}.message`);
  const orderNumber = formatOrderNumber(orderId);

  const trackingHtml =
    status === "shipped" && trackingNumber
      ? `<div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; color: #5b21b6; font-weight: 600;">${te(locale, "email.status.tracking_title")}</p>
          <p style="margin: 8px 0 0; font-size: 20px; font-weight: 700; color: #4c1d95; letter-spacing: 1px;">${escapeHtml(trackingNumber)}</p>
          <p style="margin: 6px 0 0; font-size: 12px; color: #7c3aed;">${te(locale, "email.status.tracking_hint")}</p>
        </div>`
      : "";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      ...(EMAIL_CC.length ? { cc: EMAIL_CC } : {}),
      ...(EMAIL_BCC.length ? { bcc: EMAIL_BCC } : {}),
      subject: te(locale, "email.status.subject", {
        emoji: meta.emoji,
        orderNumber,
        label,
      }),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 22px;">${meta.emoji} ${label}</h1>
            <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">${te(locale, "email.order.number", { orderNumber })}</p>
          </div>

          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 12px;">${greeting(locale, customerName)}</p>

            <div style="background: #f9fafb; border-left: 4px solid ${meta.color}; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 16px 0;">
              <p style="margin: 0; font-size: 15px; color: #374151;">${message}</p>
            </div>

            ${trackingHtml}

            <p style="margin-top: 24px;">
              <a href="https://ricambixstufe.it/account/orders"
                 style="display: inline-block; padding: 11px 22px; background: linear-gradient(135deg, #f97316, #dc2626); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                ${te(locale, "email.status.view_orders")}
              </a>
            </p>

            <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">
              ${te(locale, "email.status.support")} <a href="mailto:${ADMIN_EMAIL}" style="color: #b45309;">${ADMIN_EMAIL}</a>.<br/>
              ${te(locale, "email.team")}
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send order status update email:", error);
  }
}

/** Notify admin about a new order */
export async function sendNewOrderAdminNotification(data: OrderEmailData) {
  const paymentLabel = getPaymentLabel(data.paymentMethod, "it");

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ORDERS_EMAIL,
      ...(EMAIL_BCC.length ? { bcc: EMAIL_BCC } : {}),
      subject: `Nuovo ordine #${formatOrderNumber(data.orderId)} — ${formatEur(data.total, "it")}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b45309;">Nuovo ordine #${formatOrderNumber(data.orderId)}</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr><td style="padding: 6px 0; font-weight: 600; font-size: 14px;">Cliente</td><td style="padding: 6px 0; font-size: 14px;">${escapeHtml(data.customerName)} (${escapeHtml(data.customerEmail)})</td></tr>
            <tr><td style="padding: 6px 0; font-weight: 600; font-size: 14px;">Pagamento</td><td style="padding: 6px 0; font-size: 14px;">${paymentLabel}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: 600; font-size: 14px;">Totale</td><td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #b45309;">${formatEur(data.total, "it")}</td></tr>
          </table>

          ${buildItemsTable(data.items, "it")}

          <p style="margin-top: 16px;"><a href="https://ricambixstufe.it/admin/orders" style="display: inline-block; padding: 10px 20px; background: #b45309; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Gestisci ordini</a></p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send admin order notification:", error);
  }
}

/** Notify admin that a customer uploaded a bank transfer receipt */
export async function sendReceiptUploadedAdminNotification({
  orderId,
  customerName,
  receiptUrl,
}: {
  orderId: number;
  customerName: string;
  receiptUrl: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ORDERS_EMAIL,
      ...(EMAIL_BCC.length ? { bcc: EMAIL_BCC } : {}),
      subject: `Contabile bonifico caricata — Ordine #${orderId}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b45309;">Contabile bonifico ricevuta</h2>
          <p style="font-size: 14px;">Il cliente <strong>${escapeHtml(customerName)}</strong> ha caricato la contabile del bonifico per l'ordine <strong>#${orderId}</strong>.</p>
          <p style="margin: 20px 0;">
            <a href="${escapeHtml(receiptUrl)}" style="display: inline-block; padding: 10px 20px; background: #b45309; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Visualizza contabile</a>
          </p>
          <p style="margin-top: 16px;"><a href="https://ricambixstufe.it/admin/orders" style="color: #b45309; font-size: 14px;">Gestisci ordini</a></p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send receipt uploaded notification:", error);
  }
}

/** Notify admin that a new dealer has registered and needs approval */
export async function sendDealerRegistrationNotification({
  companyName,
  vatNumber,
  dealerName,
  dealerEmail,
  phone,
}: {
  companyName: string;
  vatNumber: string;
  dealerName: string;
  dealerEmail: string;
  phone: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ORDERS_EMAIL,
      ...(EMAIL_BCC.length ? { bcc: EMAIL_BCC } : {}),
      subject: `Nuova richiesta dealer: ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b45309;">Nuova richiesta dealer</h2>
          <p>Un nuovo rivenditore si è registrato e attende approvazione.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Azienda</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(companyName)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">P.IVA</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(vatNumber)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Nome</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(dealerName)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(dealerEmail)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Telefono</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${phone ? escapeHtml(phone) : "—"}</td></tr>
          </table>
          <p>Accedi al <a href="https://ricambixstufe.it/admin/dealers" style="color: #b45309;">pannello admin</a> per approvare o rifiutare la richiesta.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send dealer registration email:", error);
  }
}

/** Notify dealer that their request has been approved */
export async function sendDealerApprovedEmail({
  dealerEmail,
  companyName,
  discountPercent,
  locale: localeInput,
  country,
}: {
  dealerEmail: string;
  companyName: string;
  discountPercent: number;
  locale?: string | null;
  country?: string | null;
}) {
  const locale = resolveEmailLocale({
    locales: [localeInput],
    countries: [country],
  });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: dealerEmail,
      ...(EMAIL_CC.length ? { cc: EMAIL_CC } : {}),
      ...(EMAIL_BCC.length ? { bcc: EMAIL_BCC } : {}),
      subject: te(locale, "email.dealer.approved.subject", { companyName }),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">${te(locale, "email.dealer.approved.title")}</h2>
          <p>${te(locale, "email.hello")},</p>
          <p>${te(locale, "email.dealer.approved.body_before")} <strong>${escapeHtml(companyName)}</strong> ${te(locale, "email.dealer.approved.body_after")}</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #166534;">${te(locale, "email.dealer.approved.discount_label")}</p>
            <p style="margin: 8px 0 0; font-size: 36px; font-weight: 700; color: #16a34a;">${discountPercent}%</p>
          </div>
          <p>${te(locale, "email.dealer.approved.discount_text")}</p>
          <p style="margin-top: 30px;">
            <a href="https://ricambixstufe.it/login" style="display: inline-block; padding: 12px 24px; background: #b45309; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">${te(locale, "email.dealer.approved.cta")}</a>
          </p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">${te(locale, "email.team")}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send dealer approved email:", error);
  }
}

// ============================================================
// EMAIL VERIFICATION
// ============================================================

export async function sendEmailVerificationEmail({
  to,
  verificationUrl,
  name,
  locale: localeInput,
  country,
}: {
  to: string;
  verificationUrl: string;
  name?: string | null;
  locale?: string | null;
  country?: string | null;
}) {
  const locale = resolveEmailLocale({
    locales: [localeInput],
    countries: [country],
  });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: te(locale, "email.verify.subject"),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 20px;">${te(locale, "email.verify.title")}</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>${greeting(locale, name)}</p>
            <p>${te(locale, "email.verify.body")}</p>
            <p style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 14px 28px; background: #b45309; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">${te(locale, "email.verify.cta")}</a>
            </p>
            <p style="font-size: 13px; color: #6b7280;">${te(locale, "email.verify.expiry")}</p>
            <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">${te(locale, "email.verify.or_copy")} ${verificationUrl}</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">${te(locale, "email.team")}</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send email verification email:", error);
  }
}

/** Notify dealer that their request has been rejected */
export async function sendDealerRejectedEmail({
  dealerEmail,
  companyName,
  reason,
  locale: localeInput,
  country,
}: {
  dealerEmail: string;
  companyName: string;
  reason: string | null;
  locale?: string | null;
  country?: string | null;
}) {
  const locale = resolveEmailLocale({
    locales: [localeInput],
    countries: [country],
  });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: dealerEmail,
      ...(EMAIL_CC.length ? { cc: EMAIL_CC } : {}),
      ...(EMAIL_BCC.length ? { bcc: EMAIL_BCC } : {}),
      subject: te(locale, "email.dealer.rejected.subject", { companyName }),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">${te(locale, "email.dealer.rejected.title")}</h2>
          <p>${te(locale, "email.hello")},</p>
          <p>${te(locale, "email.dealer.rejected.body_before")} <strong>${escapeHtml(companyName)}</strong> ${te(locale, "email.dealer.rejected.body_after")}</p>
          ${reason ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0;"><p style="margin: 0; color: #991b1b;"><strong>${te(locale, "email.dealer.rejected.reason")}:</strong> ${escapeHtml(reason)}</p></div>` : ""}
          <p>${te(locale, "email.dealer.rejected.contact")} <a href="mailto:info@ricambixstufe.it" style="color: #b45309;">info@ricambixstufe.it</a> ${te(locale, "email.dealer.rejected.or_phone")} <strong>0423 720 404</strong>.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">${te(locale, "email.team")}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send dealer rejected email:", error);
  }
}

// ============================================================
// PASSWORD RESET
// ============================================================

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  name,
  locale: localeInput,
  country,
}: {
  to: string;
  resetUrl: string;
  name?: string | null;
  locale?: string | null;
  country?: string | null;
}) {
  const locale = resolveEmailLocale({
    locales: [localeInput],
    countries: [country],
  });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: te(locale, "email.reset.subject"),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 20px;">${te(locale, "email.reset.title")}</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>${greeting(locale, name)}</p>
            <p>${te(locale, "email.reset.body")}</p>
            <p style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: #b45309; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">${te(locale, "email.reset.cta")}</a>
            </p>
            <p style="font-size: 13px; color: #6b7280;">${te(locale, "email.reset.expiry")}</p>
            <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">${te(locale, "email.reset.or_copy")} ${resetUrl}</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">${te(locale, "email.team")}</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}
