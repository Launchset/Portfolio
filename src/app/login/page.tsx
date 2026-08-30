import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./login-form";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Sign in — Launchset",
  description: "Securely sign in to Launchset.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.topbar} aria-label="Login navigation">
        <Link className={styles.logo} href="/">LAUNCHSET<span>.</span></Link>
        <Link href="/">Back to the site</Link>
      </nav>
      <section className={styles.loginGrid}>
        <div className={styles.intro}>
          <h1>Login</h1>
          <p>Use Google or request a one-time link that verifies your email to sign you in.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
