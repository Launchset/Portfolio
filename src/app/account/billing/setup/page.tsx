import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DashboardTopbar from "@/src/components/dashboard/dashboard-topbar";
import { formatMoney, getPortalEnvironment, normalizeEmail, requirePageClient } from "@/src/lib/portal";
import LaunchsetCustomCheckout from "./custom-checkout";
import styles from "./setup.module.css";

type BillingClient = {
  name: string;
  email: string;
  monthly_fee_cents: number;
  currency: string;
  stripe_subscription_status: string | null;
  contract_signed: number;
};

export const dynamic = "force-dynamic";

export default async function BillingSetupPage() {
  const user = await requirePageClient();
  const environment = await getPortalEnvironment();
  const client = await environment.APP_DB.prepare(
    `SELECT clients.name, clients.email, clients.monthly_fee_cents, clients.currency, clients.stripe_subscription_status,
     EXISTS(SELECT 1 FROM contracts WHERE contracts.client_id = clients.id AND contracts.status = 'signed') AS contract_signed
     FROM clients WHERE clients.email = ?`,
  ).bind(normalizeEmail(user.email)).first<BillingClient>();
  if (!client) notFound();
  if (!client.contract_signed) redirect("/account#contract");
  if (client.stripe_subscription_status === "active" || client.stripe_subscription_status === "trialing") redirect("/account?billing=already-active");
  if (!environment.STRIPE_PUBLISHABLE_KEY) throw new Error("Stripe Embedded Checkout is not configured.");

  return <main className={styles.page}>
    <DashboardTopbar email={user.email} image={user.image} name={user.name} />
    <section className={styles.workspace}>
      <div className={styles.intro}>
        <Link href="/account#billing">← Back to dashboard</Link>
        <dl className={styles.summary}>
          <div><dt>Name</dt><dd>{client.name}</dd></div>
          <div><dt>Price</dt><dd>{formatMoney(client.monthly_fee_cents, client.currency)}</dd></div>
          <div><dt>Recurring</dt><dd>Monthly</dd></div>
        </dl>
      </div>
      <section className={styles.checkout} aria-label="Secure Stripe payment setup">
        <LaunchsetCustomCheckout publishableKey={environment.STRIPE_PUBLISHABLE_KEY} />
      </section>
    </section>
  </main>;
}
