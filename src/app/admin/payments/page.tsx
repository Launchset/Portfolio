import Link from "next/link";
import {
  formatMoney,
  getPortalEnvironment,
} from "@/src/features/portal/access";
import { billingStatusLabel } from "@/src/platform/stripe/stripe";
import styles from "../admin.module.css";
import PaymentActions from "./payment-actions";

type PaymentRow = {
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

export default async function PaymentsPage() {
  const { APP_DB } = await getPortalEnvironment();
  const result = await APP_DB.prepare(
    "SELECT id, name, email, monthly_fee_cents, currency, stripe_subscription_id, stripe_subscription_status, stripe_cancel_at_period_end, stripe_collection_paused FROM clients WHERE archived_at IS NULL ORDER BY created_at DESC",
  ).all<PaymentRow>();
  const rows = result.results ?? [];
  return (
    <>
      <section className={styles.pageHeader}>
        <div>
          <span>ADMIN</span>
          <h1>Payments</h1>
          <p>Recurring maintenance payment status.</p>
        </div>
      </section>
      <section className={styles.clients}>
        {rows.length === 0 ? (
          <div className={styles.empty}>No payment records yet.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Collection</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link
                        className={styles.recordLink}
                        href={`/admin/payments/${row.id}`}
                      >
                        <strong>{row.name}</strong>
                        <span>{row.email}</span>
                      </Link>
                    </td>
                    <td>
                      {formatMoney(row.monthly_fee_cents, row.currency)} / month
                    </td>
                    <td>
                      {billingStatusLabel(
                        row.stripe_subscription_status,
                        Boolean(row.stripe_cancel_at_period_end),
                        Boolean(row.stripe_collection_paused),
                      )}
                    </td>
                    <td>
                      <PaymentActions
                        cancelling={Boolean(row.stripe_cancel_at_period_end)}
                        clientId={row.id}
                        clientName={row.name}
                        frozen={Boolean(row.stripe_collection_paused)}
                        hasSubscription={Boolean(row.stripe_subscription_id)}
                      />
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
