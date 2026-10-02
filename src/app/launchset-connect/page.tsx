import type { Metadata } from "next";
import Link from "next/link";
import SmartHeader from "../work/smart-header";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Launchset Connect | Messaging integrations",
  description: "WhatsApp Messaging integrations, a private inbox and enquiry routing for connected businesses.",
  alternates: { canonical: "/launchset-connect" },
};

export default function ConnectPage() {
  return <main className={styles.page}><SmartHeader /><header className={styles.hero}>
    <span>LAUNCHSET CONNECT</span><h1>Keep up with<br />your conversations.</h1>
    <p>Receive WhatsApp Messaging integrations by email or Telegram, route messages and documents to your connected applications.</p>
    <p><Link href="/launchset-connect/workspace">Open the delivery monitor →</Link></p>
  </header><div className={styles.content}><aside className={styles.contents}><span>CONNECT</span><nav aria-label="Connect links">
    <Link href="/launchset-connect/workspace">Delivery monitor</Link><Link href="/launchset-connect/privacy">Privacy notice</Link><Link href="/launchset-connect/terms">Terms</Link></nav></aside>
    <article className={styles.notice}><section><h2>Message alerts for your business</h2><p>When a connected account receives a new message, Launchset Connect records an alert in its workspace and sends the notifications enabled by the business. Email and Telegram alerts say only that a new WhatsApp Business message arrived. Connected applications handle the conversation; generic notifications contain no customer details.</p></section>
      <section><h2>Routes for different workflows</h2><p>Routing rules can select a label using the sender, message type or words in a message. Tubudd workflows send email or Telegram alerts. Accounting workflows deliver messages and documents to the accounting backend. Connected backends can send text replies through Connect. These workflows are being tested with Meta’s test number.</p></section>
      <section><h2>Getting connected</h2><p>Connections are currently set up with Launchset and require authorisation from the business that controls the WhatsApp account. The first release is being tested ahead of Meta app review.</p><p>Contact <a href="mailto:launchsetfreelancer@gmail.com?subject=Launchset%20Connect">launchsetfreelancer@gmail.com</a> to discuss a connection.</p></section>
      <section><h2>Planned additions</h2><p>LLM business chatbots and client self-service onboarding are planned for later releases. Launchset Connect provides the messaging backend; each connected application supplies its own interface.</p></section>
    </article></div></main>;
}
