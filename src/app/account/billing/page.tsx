import { notFound } from "next/navigation";
import { requirePageClientContext } from "@/src/features/portal/access";
import { getClientAccountData } from "@/src/features/portal/client-account-data";
import {
  getClientBillingSummary,
  getClientInvoiceViews,
} from "@/src/features/portal/client-account-view";
import ClientBillingPage from "@/src/features/portal/client-billing-page";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { access, user } = await requirePageClientContext();
  const accountData = await getClientAccountData(access.id);
  if (!accountData) notFound();

  const { client, invoices } = accountData;
  const billing = getClientBillingSummary(client);
  return (
    <ClientBillingPage
      account={{ email: user.email, image: user.image, name: user.name }}
      billing={{
        ...billing,
        action: client.stripe_subscription_id ? (
          <form action="/api/billing/portal" method="post">
            <button>Cancel billing</button>
          </form>
        ) : (
          <button disabled>Cancel billing</button>
        ),
      }}
      invoices={getClientInvoiceViews(invoices)}
    />
  );
}
