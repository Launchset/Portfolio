export type StripeEnvironment = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PORTAL_CONFIGURATION_ID?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
};

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

export function billingStatusLabel(status: string | null | undefined, cancelAtPeriodEnd = false, collectionPaused = false) {
  if (collectionPaused) return "Frozen";
  if (cancelAtPeriodEnd) return "Cancelling";
  const labels: Record<string, string> = {
    active: "Active",
    trialing: "Trialing",
    past_due: "Past due",
    unpaid: "Unpaid",
    incomplete: "Setup incomplete",
    incomplete_expired: "Setup expired",
    paused: "Paused",
    canceled: "Cancelled",
  };
  return status ? labels[status] ?? status.replaceAll("_", " ") : "Setup required";
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyStripeSignature(payload: string, header: string, secret: string) {
  const parts = header.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  const expected = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}
