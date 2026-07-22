import type { Metadata } from "next";
import Link from "next/link";
import AnalyticsDeviceControl from "@/src/components/layout/analytics-device-control";
import SmartHeader from "../work/smart-header";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Cookie Notice | Launchset",
  description: "A clear explanation of essential storage and optional analytics used by the Launchset website.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <main className={styles.page}>
      <SmartHeader />
      <header className={styles.hero}>
        <span>LEGAL / COOKIES</span>
        <h1>Your choice.<br />No hidden tracking.</h1>
        <p>Essential storage remembers your preference. Google Analytics is optional and remains completely blocked unless you accept it. Last updated 22 July 2026.</p>
      </header>
      <div className={styles.content}>
        <aside className={styles.contents}><span>ON THIS PAGE</span><nav aria-label="Cookie notice contents"><a href="#meaning">What this means</a><a href="#used">Storage used</a><a href="#control">Your controls</a><a href="#device">This device</a><a href="#changes">Future changes</a></nav></aside>
        <article className={styles.notice}>
          <section id="meaning"><h2>What cookies are</h2><p>Cookies are small files placed on a device by a website. Similar browser technologies, including local storage, can remember information between visits. UK rules generally require clear information and consent before non-essential storage or tracking is used.</p><p>This site uses a basic consent approach: the Google Analytics tag is not downloaded and sends nothing until “Accept analytics” is selected. Advertising storage and personalisation remain disabled.</p></section>
          <section id="used"><h2>Storage this site uses</h2><table><thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Duration</th></tr></thead><tbody><tr><td><code>launchset-cookie-preference</code></td><td>Local browser storage / essential</td><td>Remembers whether analytics was accepted or declined.</td><td>Recognised for 6 months</td></tr><tr><td><code>_ga</code></td><td>Google Analytics / optional</td><td>Distinguishes one pseudonymous visitor from another.</td><td>Up to 2 years</td></tr><tr><td><code>_ga_&lt;container-id&gt;</code></td><td>Google Analytics / optional</td><td>Preserves information about the current visit and session.</td><td>Up to 2 years</td></tr></tbody></table><p>The optional cookies are created only after analytics consent. Actual lifetime may be shorter because of browser restrictions or Analytics property settings.</p></section>
          <section id="control"><h2>Your controls</h2><p>You can accept analytics directly from the banner or open “Cookie settings” to see essential storage and switch optional analytics on or off. The same settings can be reopened from the footer at any time.</p><p>Turning analytics off disables future measurement and removes accessible Google Analytics cookies from this site. You can also remove cookies and local storage through your browser settings. If the preference is cleared, the banner will appear again.</p><div className={styles.callout}><p>Declining analytics does not restrict any page, feature or contact option on this website.</p></div></section>
          <section id="device"><h2>Analytics on this device</h2><p>This separate device control is useful for the site owner, developers or anyone who never wants their visits included. It overrides an earlier analytics choice and stays active until it is switched back on.</p><AnalyticsDeviceControl /></section>
          <section id="changes"><h2>If the site changes</h2><p>If advertising technology or another optional tool is introduced later, it will not be loaded before the appropriate choice is offered. This notice will be updated with the provider, purpose and duration.</p><p>Questions can be sent to <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com</a>. See also our <Link href="/privacy">Privacy Notice</Link>.</p></section>
        </article>
      </div>
    </main>
  );
}
