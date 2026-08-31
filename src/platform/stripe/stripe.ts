export type StripeEnvironment = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PORTAL_CONFIGURATION_ID?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
};

export { billingStatusLabel } from "@/src/features/portal/billing-status";
export { verifyStripeSignature } from "./webhook-signature";

type StripeParameter = string | number | boolean | null | undefined;

export class StripeApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "StripeApiError";
    this.status = status;
  }
}

export async function stripeRequest<T>(
  secretKey: string,
  path: string,
  parameters: Record<string, StripeParameter> = {},
): Promise<T> {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null) body.set(key, String(value));
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = await response.json() as { error?: { message?: string } } & T;
  if (!response.ok) {
    throw new StripeApiError(payload.error?.message ?? "Stripe could not complete the request.", response.status);
  }
  return payload;
}

export function stripeId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

export function stripeTimestamp(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value * 1000 : null;
}

export function subscriptionPeriodEnd(subscription: Record<string, unknown>) {
  const direct = stripeTimestamp(subscription.current_period_end);
  if (direct) return direct;
  const items = subscription.items as { data?: Array<Record<string, unknown>> } | undefined;
  const ends = items?.data?.map((item) => stripeTimestamp(item.current_period_end) ?? 0) ?? [];
  return ends.length ? Math.max(...ends) || null : null;
}
