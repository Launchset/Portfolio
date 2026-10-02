import type { ConnectEnvironment } from "../../features/connect/types";

export const GENERIC_WHATSAPP_ALERT = "New WhatsApp Business message";

export class AlertDeliveryError extends Error {
  constructor(public code: string) { super(code); }
}

export async function sendGenericAlert(environment: ConnectEnvironment, channel: string, destination: string) {
  if (channel === "telegram") {
    const token = environment.CONNECT_TELEGRAM_BOT_TOKEN;
    if (!token) throw new AlertDeliveryError("telegram_not_configured");
    let response: Response;
    try {
      response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: destination, text: GENERIC_WHATSAPP_ALERT }),
        signal: AbortSignal.timeout(10000),
      });
    } catch { throw new AlertDeliveryError("telegram_network_error"); }
    if (!response.ok) throw new AlertDeliveryError(`telegram_http_${response.status}`);
    const result = await response.json().catch(() => null) as { ok?: boolean } | null;
    if (result?.ok !== true) throw new AlertDeliveryError("telegram_rejected");
    return;
  }
  if (channel === "email") {
    try {
      await environment.AUTH_EMAIL.send({
        from: environment.AUTH_EMAIL_FROM,
        to: destination,
        subject: GENERIC_WHATSAPP_ALERT,
        text: `${GENERIC_WHATSAPP_ALERT}. Open your WhatsApp Business inbox to read it.`,
      });
    } catch { throw new AlertDeliveryError("email_delivery_error"); }
    return;
  }
  throw new AlertDeliveryError("unsupported_channel");
}
