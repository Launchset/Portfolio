import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuth, getAdminEmail, isLaunchsetAdmin } from "@/src/lib/auth";
import { formatMoney, getClientAccess, getPortalEnvironment } from "@/src/lib/portal";
import { billingStatusLabel } from "@/src/lib/stripe";
import AccountControls from "./account-controls";
import DashboardTopbar from "@/src/components/dashboard/dashboard-topbar";
import styles from "./account.module.css";

export const dynamic = "force-dynamic";

type ClientDashboardRow = {
  id: string;
  name: string;
  email: string;
  monthly_fee_cents: number;
  currency: string;
  status: string;
  contract_id: string | null;
  contract_title: string | null;
  contract_status: string | null;
  signed_at: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  stripe_current_period_end: number | null;
  stripe_cancel_at_period_end: number;
  stripe_collection_paused: number;
};

type InvoiceRow = {
  id: string;
  number: string | null;
  status: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  created_at: number;
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ billing?: string }> }) {
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const adminEmail = await getAdminEmail();
  const isAdmin = session.user.emailVerified && isLaunchsetAdmin(session.user.email, adminEmail);

  if (!isAdmin) {
    if (!session.user.emailVerified) redirect("/access-required");
    const access = await getClientAccess(session.user.email);
    if (!access) redirect("/access-required");

    const { APP_DB } = await getPortalEnvironment();
    const client = await APP_DB.prepare(
      `SELECT clients.*, contracts.id AS contract_id, contracts.title AS contract_title,
       contracts.status AS contract_status, contracts.signed_at
       FROM clients LEFT JOIN contracts ON contracts.client_id = clients.id
       WHERE clients.id = ? ORDER BY contracts.created_at DESC LIMIT 1`,
    ).bind(access.id).first<ClientDashboardRow>();

    if (client) {
      const contractSigned = client.contract_status === "signed";
      const paymentComplete = client.stripe_subscription_status === "active" || client.stripe_subscription_status === "trialing";
      const invoices = (await APP_DB.prepare(
        `SELECT id, number, status, amount_paid, amount_due, currency, hosted_invoice_url, invoice_pdf, created_at
         FROM billing_invoices WHERE client_id = ? ORDER BY created_at DESC LIMIT 12`,
      ).bind(client.id).all<InvoiceRow>()).results ?? [];
      const billingResult = (await searchParams).billing;
      const nextBill = client.stripe_current_period_end ? new Date(client.stripe_current_period_end).toLocaleDateString("en-GB") : "Not scheduled";
      return (
        <main className={styles.dashboardPage}>
          <div className={styles.clientShell}>
            <DashboardTopbar email={session.user.email} image={session.user.image} name={session.user.name} />
            <aside className={styles.clientNav}>
              <div className={styles.clientNavLabel}>Your workspace</div>
              <nav aria-label="Client navigation">
                <a className={styles.clientActive} href="#overview"><span>01</span>Overview</a>
                <a href="#contract"><span>02</span>Contract</a>
                <a href="#billing"><span>03</span>Billing</a>
              </nav>
            </aside>
            <section className={styles.clientWorkspace}>
              <div className={styles.clientContent}>
                <section className={styles.dashboardHero} id="overview">
                  <span>CLIENT PORTAL</span><h1>Welcome, {client.name}.</h1><p>Complete your setup and keep your Launchset documents and billing in one place.</p>
                  {billingResult === "success" && <p className={styles.billingNotice}>Stripe received your setup. Billing status will update automatically.</p>}
                  {billingResult === "cancelled" && <p className={styles.billingNotice}>Payment setup was cancelled. Nothing was charged.</p>}
                  {billingResult === "already-active" && <p className={styles.billingNotice}>Your maintenance subscription is already connected.</p>}
                  {billingResult === "cancellation-scheduled" && <p className={styles.billingNotice}>Your maintenance cancellation has been scheduled.</p>}
                </section>
                <div className={styles.dashboardGrid}>
                  <section className={styles.onboarding} id="contract">
                  <div className={styles.cardHeading}><div><span>ONBOARDING</span><h2>Finish setting up</h2></div><strong>{paymentComplete ? "Complete" : contractSigned ? "1 of 2" : "0 of 2"}</strong></div>
                  <ol>
                    <li className={contractSigned ? styles.stepDone : styles.stepCurrent}><i>{contractSigned ? "✓" : "1"}</i><div><strong>Sign your contract</strong><span>{contractSigned ? `Signed ${client.signed_at ? new Date(client.signed_at).toLocaleDateString("en-GB") : ""}` : "Review the agreement and add your signature."}</span></div>{client.contract_id && (contractSigned ? <a href={`/api/contracts/${client.contract_id}/file`}>View</a> : <Link href={`/contracts/${client.contract_id}/sign`}>Review and sign</Link>)}</li>
                    <li className={paymentComplete ? styles.stepDone : contractSigned ? styles.stepCurrent : styles.stepLocked}><i>{paymentComplete ? "✓" : "2"}</i><div><strong>Set up maintenance billing</strong><span>{paymentComplete ? "Your recurring maintenance payment is active." : contractSigned ? "Secure payment setup without leaving Launchset." : "Available after your contract is signed."}</span></div>{paymentComplete ? <span className={styles.completeLabel}>Complete</span> : contractSigned ? <Link href="/account/billing/setup">Set up with Stripe</Link> : <button disabled>Set up with Stripe</button>}</li>
                  </ol>
                  </section>
                  <section className={styles.billingCard} id="billing">
                  <span>MAINTENANCE</span><h2>{formatMoney(client.monthly_fee_cents, client.currency)}<small>/month</small></h2>
                  <dl><div><dt>Status</dt><dd>{billingStatusLabel(client.stripe_subscription_status, Boolean(client.stripe_cancel_at_period_end), Boolean(client.stripe_collection_paused))}</dd></div><div><dt>{client.stripe_cancel_at_period_end ? "Ends" : client.stripe_collection_paused ? "Billing resumes" : "Next bill"}</dt><dd>{client.stripe_collection_paused ? "When Launchset unfreezes it" : nextBill}</dd></div></dl>
                  {client.stripe_subscription_id ? <form action="/api/billing/portal" method="post"><button>Cancel billing</button></form> : <button disabled>Cancel billing</button>}
                  <div className={styles.invoiceSection}>
                    <h3>Past invoices</h3>
                    {invoices.length === 0 ? <p>No invoices yet.</p> : <ul>{invoices.map((invoice: InvoiceRow) => <li key={invoice.id}><div><strong>{invoice.number ?? "Stripe invoice"}</strong><span>{new Date(invoice.created_at).toLocaleDateString("en-GB")} · {invoice.status}</span></div><span>{formatMoney(invoice.amount_paid || invoice.amount_due, invoice.currency)}</span>{(invoice.hosted_invoice_url || invoice.invoice_pdf) && <a href={invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? "#"} rel="noreferrer" target="_blank">Open</a>}</li>)}</ul>}
                  </div>
                  </section>
                </div>
              </div>
            </section>
          </div>
        </main>
      );
    }

    redirect("/access-required");
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <Link className={styles.logo} href="/">LAUNCHSET<span>.</span></Link>
        <div
          className={styles.avatar}
          style={session.user.image ? { backgroundImage: `url(${JSON.stringify(session.user.image)})` } : undefined}
        >
          {!session.user.image && (session.user.name?.charAt(0).toUpperCase() || session.user.email.charAt(0).toUpperCase())}
        </div>
        <span className={styles.eyebrow}>{isAdmin ? "ADMIN ACCOUNT" : "LAUNCHSET ACCOUNT"}</span>
        <h1>Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.</h1>
        <p>{session.user.email}</p>
        <div className={styles.verified}><i /> {session.user.emailVerified ? "Email verified" : "Email verification required"}</div>
        <div className={styles.actions}>{isAdmin && <Link href="/admin">Open admin</Link>}<AccountControls /></div>
      </section>
    </main>
  );
}
