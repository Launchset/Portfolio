import Link from "next/link";
import {
  formatMoney,
  getPortalEnvironment,
} from "@/src/features/portal/access";
import styles from "../admin.module.css";
import AddClientForm from "../add-client-form";
import ClientActions from "./client-actions";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  monthly_fee_cents: number;
  currency: string;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  stripe_cancel_at_period_end: number;
  stripe_collection_paused: number;
};

function paymentState(
  status: string | null,
  cancelling: boolean,
  frozen: boolean,
) {
  if (frozen) return { label: "Frozen", tone: styles.paymentFrozen };
  if (cancelling) return { label: "Cancelling", tone: styles.paymentPending };
  if (status === "active" || status === "trialing")
    return { label: "Ongoing", tone: styles.paymentOngoing };
  if (status === "canceled")
    return { label: "Cancelled", tone: styles.paymentCancelled };
  if (status === "past_due" || status === "unpaid")
    return { label: "Payment issue", tone: styles.paymentIssue };
  if (status === "incomplete" || status === "incomplete_expired")
    return { label: "Incomplete", tone: styles.paymentPending };
  return { label: "Not set up", tone: styles.paymentPending };
}

export default async function ClientsPage() {
  const { APP_DB } = await getPortalEnvironment();
  const result = await APP_DB.prepare(
    "SELECT id, name, email, monthly_fee_cents, currency, stripe_subscription_id, stripe_subscription_status, stripe_cancel_at_period_end, stripe_collection_paused FROM clients WHERE archived_at IS NULL ORDER BY created_at DESC",
  ).all<ClientRow>();
  const rows = result.results ?? [];
  return (
    <>
      <section className={styles.pageHeader}>
        <div>
          <span>ADMIN</span>
          <h1>Clients</h1>
          <p>Every invited and active Launchset client.</p>
        </div>
        <AddClientForm />
      </section>
      <section className={styles.clients}>
        {rows.length === 0 ? (
          <div className={styles.empty}>No clients yet.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Maintenance</th>
                  <th>Payment</th>
                  <th className={styles.actionsHeader}>
                    <span className={styles.visuallyHidden}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const payment = paymentState(
                    row.stripe_subscription_status,
                    Boolean(row.stripe_cancel_at_period_end),
                    Boolean(row.stripe_collection_paused),
                  );
                  const removalBlockReason = [
                    "active",
                    "trialing",
                    "past_due",
                    "unpaid",
                    "paused",
                  ].includes(row.stripe_subscription_status ?? "")
                    ? row.stripe_cancel_at_period_end
                      ? "Wait for cancellation"
                      : "Cancel billing first"
                    : undefined;
                  return (
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
                        {formatMoney(row.monthly_fee_cents, row.currency)} /
                        month
                      </td>
                      <td>
                        <span
                          className={`${styles.paymentStatus} ${payment.tone}`}
                        >
                          {payment.label}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <ClientActions
                          canCancelBilling={
                            Boolean(row.stripe_subscription_id) &&
                            !row.stripe_cancel_at_period_end
                          }
                          cancellationScheduled={Boolean(
                            row.stripe_cancel_at_period_end,
                          )}
                          clientId={row.id}
                          clientName={row.name}
                          removalBlockReason={removalBlockReason}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
