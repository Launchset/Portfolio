import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney, getPortalEnvironment } from "@/src/lib/portal";
import { billingStatusLabel } from "@/src/lib/stripe";
import styles from "../../admin.module.css";

type ClientDetail = { id: string; name: string; email: string; status: string; monthly_fee_cents: number; currency: string; invited_at: number | null; contract_id: string | null; contract_title: string | null; contract_status: string | null; stripe_subscription_status: string | null; stripe_cancel_at_period_end: number; stripe_collection_paused: number };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { APP_DB } = await getPortalEnvironment();
  const client = await APP_DB.prepare(`SELECT clients.*, contracts.id AS contract_id, contracts.title AS contract_title, contracts.status AS contract_status FROM clients LEFT JOIN contracts ON contracts.client_id = clients.id WHERE clients.id = ? AND clients.archived_at IS NULL ORDER BY contracts.created_at DESC LIMIT 1`).bind(id).first<ClientDetail>();
  if (!client) notFound();
  return <><Link className={styles.backLink} href="/admin/clients">← Clients</Link><section className={styles.detailHeader}><span>CLIENT</span><h1>{client.name}</h1><p>{client.email}</p></section><div className={styles.detailGrid}><section className={styles.detailPanel}><h2>Account</h2><dl><div><dt>Status</dt><dd>{client.status.replaceAll("_", " ")}</dd></div><div><dt>Maintenance</dt><dd>{formatMoney(client.monthly_fee_cents, client.currency)} / month</dd></div><div><dt>Invited</dt><dd>{client.invited_at ? new Date(client.invited_at).toLocaleDateString("en-GB") : "Not sent"}</dd></div></dl></section><section className={styles.detailPanel}><h2>Contract</h2>{client.contract_id ? <><p>{client.contract_title}</p><Link href={`/admin/contracts/${client.contract_id}`}>{client.contract_status === "signed" ? "View signed contract" : "View pending contract"}</Link></> : <p>No contract uploaded.</p>}</section><section className={styles.detailPanel}><h2>Payment</h2><p>{billingStatusLabel(client.stripe_subscription_status, Boolean(client.stripe_cancel_at_period_end), Boolean(client.stripe_collection_paused))}.</p><Link href={`/admin/payments/${client.id}`}>View payment</Link></section></div></>;
}
