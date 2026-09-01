import { formatMoney } from "@/src/shared/format/money";
import { billingStatusLabel } from "./billing-status";
import type { ClientAccount, ClientInvoice } from "./client-account-data";
import type { ClientDashboardInvoice } from "./client-dashboard";

export function getClientBillingSummary(client: ClientAccount) {
  const collectionPaused = Boolean(client.stripe_collection_paused);
  const cancelAtPeriodEnd = Boolean(client.stripe_cancel_at_period_end);
  const periodEnd = client.stripe_current_period_end
    ? new Date(client.stripe_current_period_end).toLocaleDateString("en-GB")
    : "Not scheduled";

  return {
    amount: formatMoney(client.monthly_fee_cents, client.currency),
    complete:
      client.stripe_subscription_status === "active" ||
      client.stripe_subscription_status === "trialing",
    periodLabel: cancelAtPeriodEnd
      ? "Ends"
      : collectionPaused
        ? "Billing resumes"
        : "Next bill",
    periodValue: collectionPaused ? "When Launchset unfreezes it" : periodEnd,
    status: billingStatusLabel(
      client.stripe_subscription_status,
      cancelAtPeriodEnd,
      collectionPaused,
    ),
  };
}

export function getClientInvoiceViews(
  invoices: ClientInvoice[],
): ClientDashboardInvoice[] {
  return invoices.map((invoice) => ({
    id: invoice.id,
    label: invoice.number ?? "Stripe invoice",
    detail: `${new Date(invoice.created_at).toLocaleDateString("en-GB")} · ${invoice.status}`,
    amount: formatMoney(
      invoice.amount_paid || invoice.amount_due,
      invoice.currency,
    ),
    url: invoice.hosted_invoice_url ?? invoice.invoice_pdf,
  }));
}
