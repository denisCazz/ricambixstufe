import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "RicambiXStufe <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@ricambixstufe.it";

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
      to: ADMIN_EMAIL,
      subject: `Nuova richiesta dealer: ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b45309;">Nuova richiesta dealer</h2>
          <p>Un nuovo rivenditore si è registrato e attende approvazione.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Azienda</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${companyName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">P.IVA</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${vatNumber}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Nome</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${dealerName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${dealerEmail}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Telefono</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${phone || "—"}</td></tr>
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
}: {
  dealerEmail: string;
  companyName: string;
  discountPercent: number;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: dealerEmail,
      subject: `Richiesta approvata — ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Richiesta approvata! ✓</h2>
          <p>Ciao,</p>
          <p>La tua richiesta come rivenditore per <strong>${companyName}</strong> è stata <strong>approvata</strong>.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #166534;">Il tuo sconto riservato</p>
            <p style="margin: 8px 0 0; font-size: 36px; font-weight: 700; color: #16a34a;">${discountPercent}%</p>
          </div>
          <p>Lo sconto verrà applicato automaticamente al tuo account. Accedi al sito per iniziare ad acquistare con i prezzi riservati.</p>
          <p style="margin-top: 30px;">
            <a href="https://ricambixstufe.it/login" style="display: inline-block; padding: 12px 24px; background: #b45309; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Accedi al tuo account</a>
          </p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">— Il team RicambiXStufe</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send dealer approved email:", error);
  }
}

/** Notify dealer that their request has been rejected */
export async function sendDealerRejectedEmail({
  dealerEmail,
  companyName,
  reason,
}: {
  dealerEmail: string;
  companyName: string;
  reason: string | null;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: dealerEmail,
      subject: `Richiesta rivenditore — ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Richiesta non approvata</h2>
          <p>Ciao,</p>
          <p>La tua richiesta come rivenditore per <strong>${companyName}</strong> non è stata approvata.</p>
          ${reason ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0;"><p style="margin: 0; color: #991b1b;"><strong>Motivo:</strong> ${reason}</p></div>` : ""}
          <p>Per qualsiasi domanda, contattaci a <a href="mailto:info@ricambixstufe.it" style="color: #b45309;">info@ricambixstufe.it</a> o al numero <strong>0423 720 404</strong>.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">— Il team RicambiXStufe</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send dealer rejected email:", error);
  }
}
