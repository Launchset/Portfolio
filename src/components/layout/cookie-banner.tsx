"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./cookie-banner.module.css";

const STORAGE_KEY = "launchset-cookie-preference";
const SIX_MONTHS = 1000 * 60 * 60 * 24 * 180;
type AnalyticsChoice = "granted" | "denied";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const openSettings = () => {
      setShowSettings(true);
      setVisible(true);
    };
    const initialCheck = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const saved = stored ? JSON.parse(stored) as { analytics?: AnalyticsChoice; updatedAt?: number } : null;
        const isCurrent = saved?.analytics && saved?.updatedAt && Date.now() - saved.updatedAt < SIX_MONTHS;
        setAnalyticsEnabled(saved?.analytics === "granted");
        setVisible(!isCurrent);
      } catch {
        setVisible(true);
      }
    }, 0);

    window.addEventListener("launchset:open-cookie-settings", openSettings);
    return () => {
      window.clearTimeout(initialCheck);
      window.removeEventListener("launchset:open-cookie-settings", openSettings);
    };
  }, []);

  const saveChoice = (analytics: AnalyticsChoice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics, updatedAt: Date.now() }));
    } catch {
      // The choice still applies for this page view when browser storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent("launchset:analytics-consent", { detail: analytics }));

    if (analytics === "denied") {
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0]?.trim();
        if (name === "_ga" || name?.startsWith("_ga_")) {
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        }
      });
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className={styles.banner} aria-label="Cookie information" aria-live="polite">
      {showSettings ? (
        <div className={styles.settings}>
          <div className={styles.settingsIntro}>
            <span>COOKIE SETTINGS</span>
            <h2>Choose what this site can use.</h2>
            <p>Essential storage keeps the site working and remembers this choice. Analytics is optional.</p>
          </div>

          <div className={styles.settingRow}>
            <div><strong>Essential storage</strong><p>Remembers your cookie choice and supports basic site operation.</p></div>
            <span className={styles.alwaysOn}>Always on</span>
          </div>

          <label className={styles.settingRow}>
            <div><strong>Analytics cookies</strong><p>Help us understand useful pages through Google Analytics.</p></div>
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
            <i aria-hidden="true" />
          </label>

          <div className={styles.settingsActions}>
            <Link href="/cookies">Read cookie notice</Link>
            <button type="button" onClick={() => saveChoice(analyticsEnabled ? "granted" : "denied")}>Save settings</button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <span>YOUR PRIVACY</span>
            <p>We use essential storage to remember your choice and optional analytics to understand which pages are useful.</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.secondary} type="button" onClick={() => setShowSettings(true)}>Cookie settings</button>
            <button type="button" onClick={() => saveChoice("granted")}>Accept cookies</button>
          </div>
        </>
      )}
    </aside>
  );
}
