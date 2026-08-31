import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortalEnvironment, normalizeEmail, requirePageClient } from "@/src/features/portal/access";
import SignaturePad from "./signature-pad";
import styles from "./sign.module.css";

type ContractRow = {
  id: string;
  title: string;
  status: string;
  client_name: string;
  client_email: string;
  signed_at: number | null;
};

export const dynamic = "force-dynamic";

export default async function SignContractPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageClient();
  const { id } = await params;
  const { APP_DB } = await getPortalEnvironment();
  const contract = await APP_DB.prepare(
    `SELECT contracts.id, contracts.title, contracts.status, contracts.signed_at,
     clients.name AS client_name, clients.email AS client_email
     FROM contracts JOIN clients ON clients.id = contracts.client_id WHERE contracts.id = ?`,
  ).bind(id).first<ContractRow>();

  if (!contract || normalizeEmail(contract.client_email) !== normalizeEmail(user.email)) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">LAUNCHSET<span>.</span></Link>
        <Link href="/account">Back to dashboard</Link>
      </header>
      <section className={styles.intro}>
        <span>CONTRACT</span>
        <h1>{contract.title}</h1>
        <p>Read the complete agreement before adding your signature.</p>
      </section>
      <iframe className={styles.viewer} src={`/api/contracts/${contract.id}/file?version=original`} title={contract.title} />
      {contract.status === "awaiting_signature" ? (
        <section className={styles.signSection}>
          <h2>Sign your agreement</h2>
          <p>Your signature will be securely placed into the designated signature space in this PDF.</p>
          <SignaturePad contractId={contract.id} defaultName={user.name || contract.client_name} />
        </section>
      ) : (
        <section className={styles.complete}>
          <h2>Contract signed</h2>
          <p>Your signed copy is available from your dashboard.</p>
          <a href={`/api/contracts/${contract.id}/file`}>View signed contract</a>
        </section>
      )}
    </main>
  );
}
