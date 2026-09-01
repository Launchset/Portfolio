import type { ReactNode } from "react";
import ClientPortalShell, {
  type ClientPortalSection,
} from "./client-portal-shell";
import styles from "./client-account-pages.module.css";

type ClientContractPageProps = {
  account: { email: string; image?: string | null; name?: string | null };
  contract: {
    action?: ReactNode;
    signedDate?: string | null;
    status: string;
    title: string;
  };
  routes?: Record<ClientPortalSection, string>;
};

export default function ClientContractPage({
  account,
  contract,
  routes,
}: ClientContractPageProps) {
  const signed = contract.status === "signed";
  return (
    <ClientPortalShell account={account} active="contract" routes={routes}>
      <header className={styles.pageHeader}>
        <span>CONTRACT</span>
        <h1>Your agreement.</h1>
        <p>
          Review the agreement between you and Launchset, including its current
          signing status.
        </p>
      </header>
      <section className={styles.documentCard}>
        <span>DOCUMENT</span>
        <div className={styles.documentHeading}>
          <h2>{contract.title}</h2>
          <strong className={styles.status}>
            {signed ? "Signed" : "Awaiting signature"}
          </strong>
        </div>
        <p>
          {signed
            ? "Your signed agreement is securely stored and remains available whenever you need it."
            : "Your agreement is ready to review and sign."}
        </p>
        <dl className={styles.details}>
          <div>
            <dt>Status</dt>
            <dd>{signed ? "Signed" : "Awaiting signature"}</dd>
          </div>
          <div>
            <dt>{signed ? "Signed" : "Next step"}</dt>
            <dd>
              {signed ? (contract.signedDate ?? "Complete") : "Review and sign"}
            </dd>
          </div>
        </dl>
        {contract.action && <div>{contract.action}</div>}
      </section>
    </ClientPortalShell>
  );
}
