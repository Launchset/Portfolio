import Link from "next/link";
import { getPortalEnvironment } from "@/src/features/portal/access";
import styles from "../admin.module.css";

type ContractRow = { id: string; title: string; status: string; signed_at: number | null; client_id: string; client_name: string; client_email: string };

export default async function ContractsPage() {
  const { APP_DB } = await getPortalEnvironment();
  const result = await APP_DB.prepare(`SELECT contracts.id, contracts.title, contracts.status, contracts.signed_at, clients.id AS client_id, clients.name AS client_name, clients.email AS client_email FROM contracts JOIN clients ON clients.id = contracts.client_id WHERE clients.archived_at IS NULL ORDER BY contracts.created_at DESC`).all<ContractRow>();
  const rows = result.results ?? [];
  return <><section className={styles.pageHeader}><div><span>ADMIN</span><h1>Contracts</h1><p>Pending and completed client agreements.</p></div></section><section className={styles.clients}>{rows.length === 0 ? <div className={styles.empty}>No contracts yet.</div> : <div className={styles.tableWrap}><table><thead><tr><th>Contract</th><th>Client</th><th>Status</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><Link className={styles.recordLink} href={`/admin/contracts/${row.id}`}><strong>{row.title}</strong><span>{row.signed_at ? new Date(row.signed_at).toLocaleDateString("en-GB") : "Not signed"}</span></Link></td><td><Link className={styles.recordLink} href={`/admin/clients/${row.client_id}`}><strong>{row.client_name}</strong><span>{row.client_email}</span></Link></td><td><Link className={styles.tableValueLink} href={`/admin/contracts/${row.id}`}>{row.status === "signed" ? "Signed" : row.status === "void" ? "Void" : "Awaiting signature"}</Link></td></tr>)}</tbody></table></div>}</section></>;
}
