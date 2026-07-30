const BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

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
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
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
  const mode = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
  try {
    await getAccessToken();
    return {
      ok: true,
      mode,
      message: `Autenticazione PayPal OK (modalità ${mode})`,
    };
  } catch (err) {
    if (err instanceof PayPalError) {
      return {
        ok: false,
        mode,
        message:
          err.code === "missing_credentials"
            ? `Credenziali mancanti (modalità ${mode}): imposta PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET`
            : `Autenticazione fallita (modalità ${mode}, HTTP ${err.status ?? "?"}). ` +
              `Dopo un cambio password o secret, aggiorna Client ID/Secret su developer.paypal.com e nel .env del server, poi riavvia.`,
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
  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
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
        // Prefer account login over guest card form (avoids "can't access my PayPal" confusion)
        landing_page: "LOGIN",
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
    `${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
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
