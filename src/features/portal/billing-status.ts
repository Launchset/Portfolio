export function billingStatusLabel(
  status: string | null | undefined,
  cancelAtPeriodEnd = false,
  collectionPaused = false,
) {
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

  return status
    ? (labels[status] ?? status.replaceAll("_", " "))
    : "Setup required";
}
