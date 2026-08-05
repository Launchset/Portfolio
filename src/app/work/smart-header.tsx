"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AccountLink from "@/src/components/account-link";
import styles from "./work.module.css";

export default function SmartHeader() {
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let frame = 0;
    let direction: -1 | 0 | 1 = 0;
    let directionTravel = 0;

    const updateFromScroll = () => {
      frame = 0;
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      const nextDirection: -1 | 0 | 1 = delta > 0 ? 1 : delta < 0 ? -1 : 0;

      if (nextDirection && nextDirection !== direction) {
        direction = nextDirection;
        directionTravel = 0;
      }
      directionTravel += Math.abs(delta);

      if (currentScrollY < 24) {
        setVisible(true);
        directionTravel = 0;
      } else if (direction === -1 && directionTravel >= 34) {
        setVisible(true);
        directionTravel = 0;
      } else if (direction === 1 && currentScrollY > 110 && directionTravel >= 48) {
        setVisible(false);
        setMenuOpen(false);
        directionTravel = 0;
      }

      lastScrollY.current = currentScrollY;
    };

    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateFromScroll);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.clientY <= 72) setVisible(true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={styles.header} data-visible={visible ? "true" : "false"}>
      <Link className={styles.logo} href="/">LAUNCHSET<span>.</span></Link>
      <nav id="portfolio-mobile-navigation" aria-label="Portfolio navigation" data-open={menuOpen ? "true" : "false"}>
        <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/work" onClick={() => setMenuOpen(false)}>Our work</Link>
        <Link href="/#services" onClick={() => setMenuOpen(false)}>Services</Link>
        <Link href="/#process" onClick={() => setMenuOpen(false)}>Process</Link>
        <Link href="/founder" onClick={() => setMenuOpen(false)}>Founder</Link>
        <Link href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
        <Link className={styles.mobileNavCta} href="/#contact" onClick={() => setMenuOpen(false)}>Start a project ↗</Link>
      </nav>
      <button
        className={styles.menuButton}
        type="button"
        aria-controls="portfolio-mobile-navigation"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <i /><i />
      </button>
      <div className={styles.headerActions}>
        <Link className={styles.headerCta} href="/#contact">Start a project ↗</Link>
        <AccountLink className={styles.accountLink} />
      </div>
    </header>
  );
}
