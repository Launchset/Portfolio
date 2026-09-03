import type { ReactNode } from "react";
import Link from "next/link";
import ClientPortalShell from "./client-portal-shell";
import type { ClientPortalSection } from "./client-portal-shell";
import styles from "./client-dashboard.module.css";

export type ClientDashboardInvoice = {
  id: string;
  label: string;
  detail: string;
  amount: string;
  viewUrl?: string | null;
  downloadUrl?: string | null;
};

type ClientDashboardProps = {
  account: {
    email: string;
    image?: string | null;
    name?: string | null;
  };
  clientName: string;
  billingNotice?: string | null;
  contract: {
    action?: ReactNode;
    id?: string | null;
    signed: boolean;
    signedDate?: string | null;
  };
  billing: {
    amount: string;
    complete: boolean;
    periodLabel: string;
    periodValue: string;
    status: string;
  };
  invoices: ClientDashboardInvoice[];
  billingAction: ReactNode;
  routes?: Record<ClientPortalSection, string>;
};

export default function ClientDashboard({
  account,
  billing,
  billingAction,
  billingNotice,
  clientName,
  contract,
  invoices,
  routes,
}: ClientDashboardProps) {
  const progress = billing.complete
    ? "Complete"
    : contract.signed
      ? "1 of 2"
      : "0 of 2";
  const contractAction =
    contract.action ??
    (contract.id &&
      (contract.signed ? (
        <a href={`/api/contracts/${contract.id}/file`}>View contract</a>
      ) : (
        <Link href={`/contracts/${contract.id}/sign`}>Review and sign</Link>
      )));
  const billingPanel = (
    <section className={styles.billingCard} id="billing">
      <span>MAINTENANCE</span>
      <h2>
        {billing.amount}
        <small>/month</small>
      </h2>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>{billing.status}</dd>
        </div>
        <div>
          <dt>{billing.periodLabel}</dt>
          <dd>{billing.periodValue}</dd>
        </div>
      </dl>
      <div className={styles.billingAction}>{billingAction}</div>
      <div className={styles.invoiceSection}>
        <h3>Past invoices</h3>
        {invoices.length === 0 ? (
          <p>No invoices yet.</p>
        ) : (
          <ul>
            {invoices.map((invoice) => (
              <li key={invoice.id}>
                <div>
                  <strong>{invoice.label}</strong>
                  <span>{invoice.detail}</span>
                </div>
                <span>{invoice.amount}</span>
                <span className={styles.invoiceActions}>
                  {invoice.viewUrl && (
                    <a href={invoice.viewUrl}>View</a>
                  )}
                  {invoice.downloadUrl && (
                    <a
                      href={invoice.downloadUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Download PDF
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );

  return (
    <ClientPortalShell account={account} active="overview" routes={routes}>
      {billing.complete && contract.signed ? (
        <section className={styles.completedOverview} id="overview">
          <div>
            <span>OVERVIEW</span>
            <h1>Welcome, {clientName}.</h1>
            <p>
              Your {billing.amount} monthly maintenance plan is{" "}
              {billing.status.toLowerCase()}. {billing.periodLabel}:{" "}
              {billing.periodValue}.
            </p>
            {billingNotice && (
              <p className={styles.billingNotice}>{billingNotice}</p>
            )}
          </div>
          <nav aria-label="Account overview actions">
            <a href={routes?.billing ?? "/account/billing"}>View billing</a>
            <a href={routes?.contract ?? "/account/contract"}>View contract</a>
          </nav>
        </section>
      ) : (
        <section className={styles.dashboardHero} id="overview">
          <span>CLIENT PORTAL</span>
          <h1>Welcome, {clientName}.</h1>
          <p>
            Complete your setup and keep your Launchset documents and billing in
            one place.
          </p>
          {billingNotice && (
            <p className={styles.billingNotice}>{billingNotice}</p>
          )}
        </section>
      )}
      {(!billing.complete || !contract.signed) && (
        <div className={styles.dashboardGrid}>
          <section className={styles.onboarding} id="contract">
            <div className={styles.cardHeading}>
              <div>
                <span>ONBOARDING</span>
                <h2>Finish setting up</h2>
              </div>
              <strong>{progress}</strong>
            </div>
            <ol>
              <li
                className={
                  contract.signed ? styles.stepDone : styles.stepCurrent
                }
              >
                <i>{contract.signed ? "✓" : "1"}</i>
                <div>
                  <strong>
                    {contract.signed ? "Contract signed" : "Sign your contract"}
                  </strong>
                  <span>
                    {contract.signed
                      ? `Signed ${contract.signedDate ?? ""}`
                      : "Review the agreement and add your signature."}
                  </span>
                </div>
                {contractAction}
              </li>
              <li
                className={
                  contract.signed ? styles.stepCurrent : styles.stepLocked
                }
              >
                <i>2</i>
                <div>
                  <strong>Set up maintenance billing</strong>
                  <span>
                    {contract.signed
                      ? "Secure payment setup without leaving Launchset."
                      : "Available after your contract is signed."}
                  </span>
                </div>
                {contract.signed ? (
                  <Link href="/account/billing/setup">Set up with Stripe</Link>
                ) : (
                  <button disabled>Set up with Stripe</button>
                )}
              </li>
            </ol>
          </section>
          {billingPanel}
        </div>
      )}
    </ClientPortalShell>
  );
}
