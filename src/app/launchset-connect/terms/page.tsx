import type { Metadata } from "next";
import Link from "next/link";
import SmartHeader from "../../work/smart-header";
import styles from "../../legal.module.css";

export const metadata: Metadata = {
  title: "Launchset Connect Terms of Service | Launchset",
  description: "Terms for businesses using Launchset Connect with WhatsApp Business.",
  alternates: { canonical: "/launchset-connect/terms" },
};

export default function LaunchsetConnectTermsPage() {
  return (
    <main className={styles.page}>
      <SmartHeader />
      <header className={styles.hero}>
        <span>LAUNCHSET CONNECT / TERMS</span>
        <h1>Terms for<br />connected messaging.</h1>
        <p>These terms explain the basis on which a business uses Launchset Connect, provided by John Helyar trading as Launchset. Last updated 30 September 2026.</p>
      </header>
      <div className={styles.content}>
        <aside className={styles.contents}>
          <span>ON THIS PAGE</span>
          <nav aria-label="Launchset Connect terms contents">
            <a href="#scope">Scope</a><a href="#service">The service</a><a href="#business">Business responsibilities</a><a href="#data">Customer information</a><a href="#alerts">Alerts and third parties</a><a href="#changes">Changes and ending access</a><a href="#contact">Contact</a>
          </nav>
        </aside>
        <article className={styles.notice}>
          <section id="scope"><h2>Who these terms are for</h2><p>These terms apply when a business agrees with Launchset to connect its WhatsApp Business account to Launchset Connect. They are for the connected business, not for people who message that business. A separate written proposal or service agreement sets the particular workflow, price, start date and support arrangements. If that agreement differs from these public terms, the written agreement takes priority for that business.</p></section>
          <section id="service"><h2>What Launchset Connect does</h2><p>Launchset Connect receives events from a business account that the business has authorised and performs the workflows agreed with that business. A workflow may route an enquiry, send a permitted reply or notify the business that a new message has arrived. Only the agreed workflows are enabled; connecting an account does not turn on every available feature.</p><p>Launchset will use reasonable care and skill in providing the agreed service. The exact deliverables, service period and any support commitments are set out in the business&apos;s written agreement.</p></section>
          <section id="business"><h2>What the connected business is responsible for</h2><p>The business must control, or be authorised to connect, its WhatsApp Business account and phone number. It remains responsible for its customer communications, message content, instructions to Launchset and compliance with applicable law and WhatsApp Business Platform rules. It must not use the service for unlawful messages or messaging that it is not permitted to send.</p><p>The business must keep its own account access secure, give Launchset only the access needed for the agreed workflow, and promptly tell Launchset if that access should be removed or may have been compromised. Launchset will not ask for the business&apos;s personal Facebook password.</p></section>
          <section id="data"><h2>Customer information</h2><p>The connected business decides why and how it communicates with its customers. Launchset handles conversation information only to provide the agreed workflow and on the business&apos;s documented instructions, except where the law requires otherwise. Before live customer information is processed, the business and Launchset will put in place a written data processing agreement covering the work, security, service providers and what happens to information when the connection ends.</p><p>The <Link href="/launchset-connect/privacy">Launchset Connect privacy notice</Link> explains what information the integration may handle and how to request disconnection or deletion.</p></section>
          <section id="alerts"><h2>Alerts and other services</h2><p>If the business enables a generic Telegram alert, it says only that a new WhatsApp Business message arrived. It does not include the sender&apos;s name, phone number or message text. The business should check its WhatsApp inbox for the actual message.</p><p>Message and alert delivery also depends on Meta, hosting, notification services and internet connections. An alert may be delayed or fail, so the business should continue to monitor its usual inbox and should not rely on the alert for emergencies or time-critical decisions. Those other services have their own terms and charges. The business&apos;s written agreement states any Launchset fees and who pays any third-party charges.</p></section>
          <section id="changes"><h2>Changes and ending access</h2><p>Launchset will discuss material changes to an agreed workflow with the business before enabling them. Launchset may pause a connection where reasonably needed to address a security issue, misuse, a legal requirement or a restriction imposed by a service provider, and will tell the business as soon as reasonably practical.</p><p>The business can ask Launchset to disconnect its account. The written agreement governs ending the service, and the agreed data processing terms govern the return or deletion of customer information. Nothing in these public terms limits responsibility that cannot lawfully be limited.</p></section>
          <section id="contact"><h2>Questions and other terms</h2><p>Contact <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com</a> about these terms or an account connection. We may update this public page as the service changes, with the revision date shown above. An update does not override a business&apos;s existing written agreement. The <Link href="/terms">website terms</Link> apply to browsing Launchset&apos;s public website.</p></section>
        </article>
      </div>
    </main>
  );
}
