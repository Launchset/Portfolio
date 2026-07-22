import type { Metadata } from "next";
import Link from "next/link";
import SmartHeader from "../work/smart-header";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Website Terms | Launchset",
  description: "Terms governing use of the Launchset portfolio website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <SmartHeader />
      <header className={styles.hero}>
        <span>LEGAL / WEBSITE TERMS</span>
        <h1>Simple terms<br />for using this site.</h1>
        <p>These terms apply to use of the Launchset portfolio website. They do not replace the separate agreement used when Launchset undertakes client work. Last updated 22 July 2026.</p>
      </header>
      <div className={styles.content}>
        <aside className={styles.contents}><span>ON THIS PAGE</span><nav aria-label="Website terms contents"><a href="#use">Using the site</a><a href="#content">Portfolio content</a><a href="#links">External links</a><a href="#liability">Responsibility</a><a href="#contact">Contact</a></nav></aside>
        <article className={styles.notice}>
          <section id="use"><h2>Using the website</h2><p>You may browse this website and contact Launchset about genuine projects or services. You must not misuse the site, attempt unauthorised access, interfere with its operation, introduce harmful code, or use its content unlawfully.</p></section>
          <section id="content"><h2>Portfolio and intellectual property</h2><p>The design, written content, code presentation, branding and original portfolio material on this website belong to Launchset or are used with permission. They may not be copied, republished or presented as someone else&apos;s work without permission.</p><p>Project examples describe work and outcomes for general information. They are not a promise that every project will produce the same result. Scope, deliverables, price, ownership and support for client work are agreed separately in writing.</p></section>
          <section id="links"><h2>External websites</h2><p>The site may link to client websites, email software, regulators or other third-party services. Launchset does not control those websites and is not responsible for their availability, security, content or privacy practices. A link does not automatically mean endorsement.</p></section>
          <section id="liability"><h2>Availability and responsibility</h2><p>We aim to keep the site accurate and available, but it may be changed, suspended or unavailable without notice. General website content should not be treated as legal, financial or other professional advice.</p><p>To the fullest extent allowed by law, Launchset is not responsible for losses caused solely by relying on general portfolio content or by temporary website unavailability. Nothing in these terms excludes or limits responsibility that cannot lawfully be excluded or limited.</p></section>
          <section id="contact"><h2>Changes and contact</h2><p>These terms may be updated when the website or relevant requirements change. The latest version will remain available on this page with its revision date.</p><p>Questions about these terms can be sent to <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com</a>. See also the <Link href="/privacy">Privacy Notice</Link> and <Link href="/cookies">Cookie Notice</Link>.</p></section>
        </article>
      </div>
    </main>
  );
}
