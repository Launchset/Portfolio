import type { Metadata } from "next";
import Link from "next/link";
import AccountControls from "@/src/app/account/account-controls";
import { getPageUser } from "@/src/features/portal/access";
import styles from "./access-required.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client access required — Launchset",
  description: "Launchset client portal access is invitation-only.",
  robots: { index: false, follow: false },
};

export default async function AccessRequiredPage() {
  const user = await getPageUser();

  return (
    <main className={styles.page}>
      <nav className={styles.topbar} aria-label="Account navigation">
        <Link className={styles.logo} href="/">LAUNCHSET<span>.</span></Link>
        <Link href="/">Back to the site</Link>
      </nav>
      <section className={styles.panel}>
        <span className={styles.eyebrow}>INVITE-ONLY ACCESS</span>
        <h1>Doesn&apos;t look like you&apos;re one of our clients.</h1>
        <p>
          This portal is reserved for invited Launchset clients. If you already work with us,
          sign in with the exact email address that received your invitation.
        </p>
        <div className={styles.identity}>
          <span>Signed in as</span>
          <strong>{user.email}</strong>
        </div>
        <div className={styles.actions}>
          <a href="mailto:launchsetfreelancer@gmail.com?subject=Launchset%20client%20portal%20access">Get in touch to request an account</a>
          <AccountControls />
        </div>
      </section>
    </main>
  );
}
