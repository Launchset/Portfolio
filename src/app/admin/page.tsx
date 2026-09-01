import Link from "next/link";
import { getPortalEnvironment } from "@/src/features/portal/access";
import { billingStatusLabel } from "@/src/platform/stripe/stripe";
import styles from "./admin.module.css";

type OverviewRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  stripe_subscription_status: string | null;
  stripe_cancel_at_period_end: number;
  stripe_collection_paused: number;
  contract_id: string | null;
  contract_status: string | null;
};

export default async function AdminPage() {
  const { APP_DB } = await getPortalEnvironment();
  const result = await APP_DB.prepare(
    `SELECT clients.id, clients.name, clients.email, clients.status, clients.stripe_subscription_status,
     clients.stripe_cancel_at_period_end, clients.stripe_collection_paused,
     contracts.id AS contract_id, contracts.status AS contract_status
     FROM clients LEFT JOIN contracts ON contracts.id = (
       SELECT latest_contract.id FROM contracts AS latest_contract
       WHERE latest_contract.client_id = clients.id
       ORDER BY latest_contract.created_at DESC LIMIT 1
     )
     WHERE clients.archived_at IS NULL
     ORDER BY clients.created_at DESC`,
  ).all<OverviewRow>();
  const rows = result.results ?? [];

  return (
    <>
      <section className={styles.pageHeader}>
        <div>
          <span>ADMIN</span>
          <h1>Overview</h1>
          <p>Open a client, contract or payment record directly.</p>
        </div>
      </section>
      <section className={styles.clients}>
        <div className={styles.sectionHeading}>
          <h2>Overview</h2>
          <span>{rows.length} clients</span>
        </div>
        {rows.length === 0 ? (
          <div className={styles.empty}>
            <h3>No clients yet</h3>
            <p>Add your first client to begin.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contract</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link
                        className={styles.recordLink}
                        href={`/admin/clients/${row.id}`}
                      >
                        <strong>{row.name}</strong>
                        <span>{row.email}</span>
                      </Link>
                    </td>
                    <td>
                      {row.contract_id ? (
                        <Link
                          className={styles.tableValueLink}
                          href={`/admin/contracts/${row.contract_id}`}
                        >
                          {row.contract_status === "signed"
                            ? "Signed"
                            : "Awaiting signature"}
                        </Link>
                      ) : (
                        <span className={styles.unavailable}>No contract</span>
                      )}
                    </td>
                    <td>
                      <Link
                        className={styles.tableValueLink}
                        href={`/admin/payments/${row.id}`}
                      >
                        {billingStatusLabel(
                          row.stripe_subscription_status,
                          Boolean(row.stripe_cancel_at_period_end),
                          Boolean(row.stripe_collection_paused),
                        )}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
