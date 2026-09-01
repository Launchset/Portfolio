import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuth, getAdminEmail, isLaunchsetAdmin } from "@/src/lib/auth";
import { getClientAccess } from "@/src/features/portal/access";
import { getClientAccountData } from "@/src/features/portal/client-account-data";
import {
  getClientBillingSummary,
  getClientInvoiceViews,
} from "@/src/features/portal/client-account-view";
import ClientDashboard from "@/src/features/portal/client-dashboard";
import AccountControls from "./account-controls";
import styles from "./account.module.css";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const adminEmail = await getAdminEmail();
  const isAdmin =
    session.user.emailVerified &&
    isLaunchsetAdmin(session.user.email, adminEmail);

  if (!isAdmin) {
    if (!session.user.emailVerified) redirect("/access-required");
    const access = await getClientAccess(session.user.email);
    if (!access) redirect("/access-required");
    const accountData = await getClientAccountData(access.id);

    if (accountData) {
      const { client, invoices } = accountData;
      const contractSigned = client.contract_status === "signed";
      const billingResult = (await searchParams).billing;
      const billing = getClientBillingSummary(client);
      const billingNotices: Record<string, string> = {
        success:
          "Stripe received your setup. Billing status will update automatically.",
        cancelled: "Payment setup was cancelled. Nothing was charged.",
        "already-active": "Your maintenance subscription is already connected.",
        "cancellation-scheduled":
          "Your maintenance cancellation has been scheduled.",
      };
      const dashboardInvoices = getClientInvoiceViews(invoices);

      return (
        <ClientDashboard
          account={{
            email: session.user.email,
            image: session.user.image,
            name: session.user.name,
          }}
          billing={billing}
          billingAction={
            client.stripe_subscription_id ? (
              <form action="/api/billing/portal" method="post">
                <button>Cancel billing</button>
              </form>
            ) : (
              <button disabled>Cancel billing</button>
            )
          }
          billingNotice={billingResult ? billingNotices[billingResult] : null}
          clientName={client.name}
          contract={{
            id: client.contract_id,
            signed: contractSigned,
            signedDate: client.signed_at
              ? new Date(client.signed_at).toLocaleDateString("en-GB")
              : null,
          }}
          invoices={dashboardInvoices}
        />
      );
    }

    redirect("/access-required");
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <Link className={styles.logo} href="/">
          LAUNCHSET<span>.</span>
        </Link>
        <div
          className={styles.avatar}
          style={
            session.user.image
              ? {
                  backgroundImage: `url(${JSON.stringify(session.user.image)})`,
                }
              : undefined
          }
        >
          {!session.user.image &&
            (session.user.name?.charAt(0).toUpperCase() ||
              session.user.email.charAt(0).toUpperCase())}
        </div>
        <span className={styles.eyebrow}>
          {isAdmin ? "ADMIN ACCOUNT" : "LAUNCHSET ACCOUNT"}
        </span>
        <h1>
          Welcome back
          {session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.
        </h1>
        <p>{session.user.email}</p>
        <div className={styles.verified}>
          <i />{" "}
          {session.user.emailVerified
            ? "Email verified"
            : "Email verification required"}
        </div>
        <div className={styles.actions}>
          {isAdmin && <Link href="/admin">Open admin</Link>}
          <AccountControls />
        </div>
      </section>
    </main>
  );
}
