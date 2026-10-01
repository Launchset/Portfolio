import type { Metadata } from "next";
import Link from "next/link";
import SmartHeader from "../../work/smart-header";
import styles from "../../legal.module.css";

export const metadata: Metadata = {
  title: "Launchset Connect Privacy Notice | Launchset",
  description: "How Launchset Connect handles WhatsApp Business account and message data.",
  alternates: { canonical: "/launchset-connect/privacy" },
};

export default function LaunchsetConnectPrivacyPage() {
  return (
    <main className={styles.page}>
      <SmartHeader />
      <header className={styles.hero}>
        <span>LAUNCHSET CONNECT / PRIVACY</span>
        <h1>Privacy for<br />connected messaging.</h1>
        <p>This notice explains how Launchset Connect handles information when a business connects its WhatsApp Business account to a workflow provided by Launchset. Last updated 1 October 2026.</p>
      </header>
      <div className={styles.content}>
        <aside className={styles.contents}>
          <span>ON THIS PAGE</span>
          <nav aria-label="Launchset Connect privacy notice contents">
            <a href="#who">Who is responsible</a><a href="#data">Information handled</a><a href="#use">How it is used</a><a href="#sharing">Sharing</a><a href="#retention">Retention</a><a href="#rights">Rights and deletion</a><a href="#contact">Contact</a>
          </nav>
        </aside>
        <article className={styles.notice}>
          <section id="who"><h2>Who is responsible</h2><p>Launchset Connect is provided by John Helyar, trading as Launchset. For WhatsApp conversations handled on behalf of a connected business, that business decides why and how it communicates with its customers. Launchset processes that conversation information to provide the workflow the business has requested. Launchset is responsible for information it uses to manage its own business relationships, service access and security.</p><p>Questions can be sent to <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com</a>.</p></section>
          <section id="data"><h2>Information the app may handle</h2><p>When a business connects its WhatsApp Business account, the app may receive its account and phone number identifiers, connection details and webhook events. Depending on the workflow enabled by that business, an event may contain a customer phone number, profile name, message text or button response, message identifier and delivery status. A workflow may also collect enquiry details that a customer chooses to provide.</p><p>Launchset also receives the business contact details and technical records needed to set up the service, provide support, keep it secure and diagnose failures. Access credentials are held in backend configuration and are not published in website code.</p></section>
          <section id="use"><h2>How information is used</h2><p>Launchset uses the information to connect the business account, receive and route events, send replies or notifications requested by the business, deliver enquiries, provide support and protect the service. Each connected business chooses which of those workflows to enable. Launchset does not sell WhatsApp conversation information or use it for advertising.</p><p>Where a business enables a generic Telegram alert, the alert says only that a new WhatsApp Business message arrived. It does not include the message text, sender name or phone number.</p></section>
          <section id="sharing"><h2>Who receives information</h2><p>WhatsApp communications are handled through Meta. Launchset uses service providers needed to host and operate the integration, including Cloudflare. Information is sent to an email or notification service only when the connected business has enabled the relevant workflow. A generic Telegram alert contains no WhatsApp message content or sender details. Information may also be shared where required by law or to protect the service.</p><p>Some providers may process information outside the UK. Where a restricted transfer requires safeguards, Launchset and the connected business will use the applicable arrangements for that service.</p></section>
          <section id="retention"><h2>How long information is kept</h2><p>The first message-alert release does not store customer message text, sender phone numbers, profile names or attachments. It stores a message identifier, message type, receipt time, business connection, routing label, work status and alert delivery records for 30 days. Email and Telegram destination details are retained while a connection is configured. Removing a connection deletes its stored alert records and destinations.</p><p>For any later conversation or enquiry workflow, information will be kept according to the connected business&apos;s agreed retention requirements, and only while needed to provide the service or meet a legal obligation. Technical and security records are kept only as long as reasonably needed to investigate delivery problems, protect the integration and maintain necessary business records. When a connection ends, Launchset will delete or return information processed for that business as agreed, unless the law requires it to be kept.</p></section>
          <section id="rights"><h2>Rights and deletion requests</h2><p>If you messaged a business using WhatsApp, contact that business first about access, correction or deletion of your conversation. Launchset will help the business respond to requests involving information processed through Launchset Connect.</p><p>A connected business can request disconnection or deletion by emailing <a href="mailto:launchsetfreelancer@gmail.com?subject=Launchset%20Connect%20data%20deletion">launchsetfreelancer@gmail.com</a> with the business name and the account or phone number concerned. Launchset will verify that the requester is authorised before changing or deleting account data. Please do not email passwords, access tokens or copies of customer conversations. You can also raise a concern with the <a href="https://ico.org.uk/make-a-complaint/" rel="noreferrer">Information Commissioner&apos;s Office</a>.</p></section>
          <section id="contact"><h2>Contact and other notices</h2><p>For privacy questions or a deletion request, email <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com</a>. This notice will be updated when Launchset Connect adds a new way of using or sharing information. The <Link href="/launchset-connect/terms">Launchset Connect terms</Link> explain how businesses use the integration. The separate <Link href="/privacy">Launchset website privacy notice</Link> explains how information from the public website is handled.</p></section>
        </article>
      </div>
    </main>
  );
}
