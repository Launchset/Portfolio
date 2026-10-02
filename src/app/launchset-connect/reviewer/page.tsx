import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortalEnvironment } from "@/src/features/portal/access";
import { connectReviewerEmail } from "@/src/features/connect/reviewer-login";
import styles from "@/src/app/login/login.module.css";
import ReviewerLoginForm from "./reviewer-login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Reviewer sign in | Launchset Connect",
  robots: { index: false, follow: false },
};

export default async function ReviewerLoginPage() {
  if (!connectReviewerEmail(await getPortalEnvironment())) notFound();
  return <main className={styles.page}>
    <nav className={styles.topbar} aria-label="Login navigation">
      <Link className={styles.logo} href="/launchset-connect">LAUNCHSET<span>.</span></Link>
      <Link href="/launchset-connect">Launchset Connect</Link>
    </nav>
    <section className={styles.loginGrid}>
      <div className={styles.intro}>
        <h1>Reviewer sign in.</h1>
        <p>Use your review account to check the test connection and message delivery results.</p>
      </div>
      <ReviewerLoginForm />
    </section>
  </main>;
}
