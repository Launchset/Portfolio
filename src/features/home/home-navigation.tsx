import type { RefObject } from "react";
import Link from "next/link";
import AccountLink from "@/src/components/account-link";
import styles from "./scroll-hero.module.css";

type NavigationProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
};

type HandoffNavigationProps = NavigationProps & {
  navRef: RefObject<HTMLElement | null>;
};

function MenuButton({ menuOpen, onToggleMenu }: NavigationProps) {
  return (
    <button
      className={styles.heroMenuButton}
      type="button"
      aria-expanded={menuOpen}
      aria-controls="home-mobile-navigation"
      aria-label={menuOpen ? "Close navigation" : "Open navigation"}
      onClick={onToggleMenu}
    ><i /><i /></button>
  );
}

export function HandoffNavigation({ menuOpen, navRef, onToggleMenu }: HandoffNavigationProps) {
  return (
    <nav className={styles.handoffNav} ref={navRef} data-visible="false" aria-label="Main navigation">
      <a href="#top" aria-label="Launchset home">LAUNCHSET<span>.</span></a>
      <div className={styles.handoffLinks}>
        <Link href="/work">Work</Link>
        <a href="#services">Services</a>
        <a href="#process">Process</a>
        <a href="/founder">Founder</a>
      </div>
      <MenuButton menuOpen={menuOpen} onToggleMenu={onToggleMenu} />
      <div className={styles.navActions}>
        <a className={styles.handoffCta} href="#contact">Start a project ↗</a>
        <AccountLink className={styles.accountLink} />
      </div>
    </nav>
  );
}

export function MobileNavigation({ menuOpen, onClose }: { menuOpen: boolean; onClose: () => void }) {
  return (
    <nav id="home-mobile-navigation" className={styles.mobileNavPanel} data-open={menuOpen ? "true" : "false"} aria-label="Mobile navigation">
      <Link href="/work" onClick={onClose}>Our work</Link>
      <a href="#services" onClick={onClose}>Services</a>
      <a href="#process" onClick={onClose}>Process</a>
      <a href="/founder" onClick={onClose}>Founder</a>
      <a href="#contact" onClick={onClose}>Start a project <span>↗</span></a>
    </nav>
  );
}

export function IntroNavigation({ menuOpen, onToggleMenu }: NavigationProps) {
  return (
    <nav className={styles.nav} aria-label="Intro navigation">
      <a className={styles.logo} href="#top" aria-label="Launchset home">LAUNCHSET<span>.</span></a>
      <div className={styles.navLinks}>
        <Link href="/work">Work</Link>
        <a href="#services">Services</a>
        <a href="#process">Process</a>
        <a href="/founder">Founder</a>
      </div>
      <MenuButton menuOpen={menuOpen} onToggleMenu={onToggleMenu} />
      <div className={styles.navActions}>
        <a className={styles.navCta} href="#contact">Start a project <span>↗</span></a>
        <AccountLink className={styles.accountLink} />
      </div>
    </nav>
  );
}
