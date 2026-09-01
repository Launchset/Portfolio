import type { ReactNode } from "react";
import type { ClientDashboardInvoice } from "./client-dashboard";
import ClientPortalShell, {
  type ClientPortalSection,
} from "./client-portal-shell";
import styles from "./client-account-pages.module.css";

type ClientBillingPageProps = {
  account: { email: string; image?: string | null; name?: string | null };
  billing: {
    action: ReactNode;
    amount: string;
    periodLabel: string;
    periodValue: string;
    status: string;
  };
  invoices: ClientDashboardInvoice[];
  routes?: Record<ClientPortalSection, string>;
};

export default function ClientBillingPage({
  account,
  billing,
  invoices,
  routes,
}: ClientBillingPageProps) {
  return (
    <ClientPortalShell account={account} active="billing" routes={routes}>
      <header className={styles.pageHeader}>
        <span>BILLING</span>
        <h1>Maintenance billing.</h1>
        <p>Review your maintenance payment, billing status and invoices.</p>
      </header>
      <div className={styles.billingGrid}>
        <section className={styles.billingSummary}>
          <span>MONTHLY PLAN</span>
          <h2>
            {billing.amount}
            <small>/month</small>
          </h2>
          <dl className={styles.details}>
            <div>
              <dt>Status</dt>
              <dd>{billing.status}</dd>
            </div>
            <div>
              <dt>{billing.periodLabel}</dt>
              <dd>{billing.periodValue}</dd>
            </div>
          </dl>
          <div className={styles.billingAction}>{billing.action}</div>
        </section>
        <section className={styles.invoiceCard}>
          <h2>Past invoices</h2>
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
                  {invoice.url && (
                    <a href={invoice.url} rel="noreferrer" target="_blank">
                      Open
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ClientPortalShell>
  );
}
