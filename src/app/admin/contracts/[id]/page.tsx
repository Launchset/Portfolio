import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortalEnvironment } from "@/src/features/portal/access";
import styles from "../../admin.module.css";

type ContractDetail = { id: string; title: string; status: string; signed_at: number | null; signer_name: string | null; signer_email: string | null; original_sha256: string; signed_sha256: string | null; client_id: string; client_name: string; client_email: string };

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { APP_DB } = await getPortalEnvironment();
  const contract = await APP_DB.prepare(`SELECT contracts.*, clients.id AS client_id, clients.name AS client_name, clients.email AS client_email FROM contracts JOIN clients ON clients.id = contracts.client_id WHERE contracts.id = ? AND clients.archived_at IS NULL`).bind(id).first<ContractDetail>();
  if (!contract) notFound();
  return <><Link className={styles.backLink} href="/admin/contracts">← Contracts</Link><section className={styles.detailHeader}><span>CONTRACT</span><h1>{contract.title}</h1><p><Link href={`/admin/clients/${contract.client_id}`}>{contract.client_name}</Link> · {contract.client_email}</p></section><div className={styles.detailGrid}><section className={styles.detailPanel}><h2>Status</h2><dl><div><dt>State</dt><dd>{contract.status.replaceAll("_", " ")}</dd></div><div><dt>Signed</dt><dd>{contract.signed_at ? new Date(contract.signed_at).toLocaleString("en-GB") : "Not yet"}</dd></div><div><dt>Signer</dt><dd>{contract.signer_name ?? "—"}</dd></div></dl></section><section className={styles.detailPanel}><h2>Document</h2><p>Original hash: <code>{contract.original_sha256.slice(0, 16)}…</code></p>{contract.signed_sha256 && <p>Signed hash: <code>{contract.signed_sha256.slice(0, 16)}…</code></p>}<a href={`/api/contracts/${contract.id}/file`}>{contract.status === "signed" ? "Open signed PDF" : "Open original PDF"}</a></section></div></>;
}
