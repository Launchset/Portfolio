import type { Metadata } from "next";
import Link from "next/link";
import SmartHeader from "../work/smart-header";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Notice | Launchset",
  description: "How Launchset handles personal information when you visit the website or get in touch.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <SmartHeader />
      <header className={styles.hero}>
        <span>LEGAL / PRIVACY</span>
        <h1>Privacy,<br />without surprises.</h1>
        <p>This notice explains what information Launchset may receive through this website, including optional analytics, why it is used and the choices available to you. Last updated 22 July 2026.</p>
      </header>
      <div className={styles.content}>
        <aside className={styles.contents}>
          <span>ON THIS PAGE</span>
          <nav aria-label="Privacy notice contents">
            <a href="#who">Who we are</a><a href="#collect">Information collected</a><a href="#use">How it is used</a><a href="#sharing">Sharing</a><a href="#retention">Retention</a><a href="#rights">Your rights</a><a href="#contact">Contact</a>
          </nav>
        </aside>
        <article className={styles.notice}>
          <section id="who"><h2>Who we are</h2><p>Launchset is a design, development and automation studio. For this website, Launchset is responsible for deciding how personal information is used.</p><p>You can contact us at <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com</a>.</p></section>
          <section id="collect"><h2>Information we may receive</h2><p>The website does not currently contain a contact form or use advertising trackers.</p><ul><li><strong>Information you send:</strong> if you email us, we receive your email address and anything you choose to include, such as your name, company, project requirements or correspondence.</li><li><strong>Basic technical records:</strong> the hosting and security services used to deliver the website may process information such as an IP address, browser type, requested page, time and security events.</li><li><strong>Analytics information, if accepted:</strong> Google Analytics may receive a pseudonymous browser identifier, IP-derived approximate location, device and browser information, pages visited, session information and interactions with the site.</li><li><strong>Cookie preference:</strong> your browser stores whether you accepted or declined analytics. This is used to respect your choice.</li></ul></section>
          <section id="use"><h2>Why we use it</h2><p>Information is used only where needed to operate and protect the website, respond to enquiries, discuss or deliver requested work, maintain business records and meet legal obligations. If you consent, analytics is used to understand which pages are useful and improve the website.</p><p>Depending on the situation, the lawful basis is our legitimate interest in running and securing the studio and responding to genuine business enquiries, taking steps towards a contract at your request, performing an agreed contract, or complying with a legal obligation. <strong>Google Analytics is used on the basis of your consent.</strong></p><div className={styles.callout}><p>We do not use information received through this website for automated decisions that produce legal or similarly significant effects.</p></div></section>
          <section id="sharing"><h2>Who information is shared with</h2><p>Information may be handled by service providers needed to host the website, deliver email or support the business. If analytics is accepted, measurement information is processed by Google. Information may also be disclosed to professional advisers, regulators or law-enforcement bodies where reasonably necessary or legally required.</p><p>We do not sell personal information. Where a service provider processes information outside the UK, we expect the provider to use an appropriate legal transfer mechanism where one is required.</p></section>
          <section id="retention"><h2>How long it is kept</h2><p>We keep personal information only for as long as it is reasonably needed for the enquiry, working relationship, security purpose or legal record involved. Records are reviewed and deleted or anonymised when there is no continuing business or legal reason to keep them.</p><p>The cookie preference is treated as current for six months. Google Analytics cookies have a default lifetime of up to two years, subject to browser limits and the settings applied to the Analytics property.</p></section>
          <section id="rights"><h2>Your rights</h2><p>Depending on the circumstances, UK data-protection law may give you rights to access, correct, erase or restrict the use of your information, receive a portable copy, or object to particular uses.</p><p><strong>You may withdraw analytics consent or object to processing based on legitimate interests at any time.</strong> Use “Cookie settings” in the footer to change analytics consent, or email <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com</a> to make a request. You may also complain to the <a href="https://ico.org.uk/make-a-complaint/" rel="noreferrer">Information Commissioner&apos;s Office</a>.</p></section>
          <section id="contact"><h2>Questions or changes</h2><p>If this website introduces advertising technology or new ways of collecting information, this notice and the cookie notice will be updated before those tools are used where consent is required.</p><p>Questions can be sent to <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com</a>. You can also read the <Link href="/cookies">Cookie Notice</Link> and <Link href="/terms">Website Terms</Link>.</p></section>
        </article>
      </div>
    </main>
  );
}
