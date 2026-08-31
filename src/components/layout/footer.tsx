"use client";

import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
  const openCookieSettings = () => {
    window.dispatchEvent(new Event("launchset:open-cookie-settings"));
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.identity}>
          <Link href="/" className={styles.logo}>LAUNCHSET<span>.</span></Link>
        </div>

        <nav className={styles.siteLinks} aria-label="Footer navigation">
          <span>EXPLORE</span>
          <Link href="/">Home</Link>
          <Link href="/work">Our work</Link>
          <Link href="/founder">Founder</Link>
          <Link href="/#services">Services</Link>
        </nav>

        <div className={styles.contact}>
          <span>START A CONVERSATION</span>
          <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com <b>↗</b></a>
          <a className={styles.socialLink} href="https://www.linkedin.com/in/johnhelyar1/" target="_blank" rel="noreferrer">LinkedIn <b>↗</b></a>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Launchset</p>
        <div className={styles.legalLinks}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/terms">Website terms</Link>
          <button type="button" onClick={openCookieSettings}>Cookie settings</button>
        </div>
        <p>Design · systems · automation</p>
      </div>
    </footer>
  );
}
