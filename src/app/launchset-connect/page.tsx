import type { Metadata } from "next";
import Link from "next/link";
import SmartHeader from "../work/smart-header";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Launchset Connect | Business message alerts",
  description: "WhatsApp Business message alerts, a private inbox and enquiry routing for connected businesses.",
  alternates: { canonical: "/launchset-connect" },
};

export default function ConnectPage() {
  return <main className={styles.page}><SmartHeader /><header className={styles.hero}>
    <span>LAUNCHSET CONNECT</span><h1>Keep up with<br />your conversations.</h1>
    <p>Receive WhatsApp Business message alerts by email or Telegram, track them in your private workspace and route the work to the right team.</p>
    <p><Link href="/launchset-connect/workspace">Open your workspace →</Link></p>
  </header><div className={styles.content}><aside className={styles.contents}><span>CONNECT</span><nav aria-label="Connect links">
    <Link href="/launchset-connect/workspace">Workspace</Link><Link href="/launchset-connect/privacy">Privacy notice</Link><Link href="/launchset-connect/terms">Terms</Link></nav></aside>
    <article className={styles.notice}><section><h2>Message alerts for your business</h2><p>When a connected account receives a new message, Launchset Connect records an alert in its workspace and sends the notifications enabled by the business. Email and Telegram alerts say only that a new WhatsApp Business message arrived. Read and reply to the conversation in your usual WhatsApp Business inbox.</p></section>
      <section><h2>A workspace for the work that follows</h2><p>Filter alerts by business, assign a routing label and mark each item as new, in progress or done. Each business member sees the connections assigned to their verified email. Launchset manages account setup and delivery settings.</p></section>
      <section><h2>Getting connected</h2><p>Connections are currently set up with Launchset and require authorisation from the business that controls the WhatsApp account. The first release is being tested ahead of Meta app review.</p><p>Contact <a href="mailto:launchsetfreelancer@gmail.com?subject=Launchset%20Connect">launchsetfreelancer@gmail.com</a> to discuss a connection.</p></section>
      <section><h2>Planned additions</h2><p>Business chatbots and direct actions in booking, support and accounting applications are planned for later releases. The current version provides message alerts and workspace routing.</p></section>
    </article></div></main>;
}
