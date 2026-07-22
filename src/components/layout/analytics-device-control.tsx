"use client";

import { useEffect, useState } from "react";
import styles from "./analytics-device-control.module.css";

const OWNER_OPT_OUT_KEY = "launchset-owner-analytics-disabled";

function clearAnalyticsCookies() {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (name === "_ga" || name?.startsWith("_ga_")) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  });
}

export default function AnalyticsDeviceControl() {
  const [disabled, setDisabled] = useState<boolean | null>(null);

  useEffect(() => {
    const initialCheck = window.setTimeout(() => {
      try {
        setDisabled(window.localStorage.getItem(OWNER_OPT_OUT_KEY) === "true");
      } catch {
        setDisabled(false);
      }
    }, 0);
    return () => window.clearTimeout(initialCheck);
  }, []);

  const update = (nextDisabled: boolean) => {
    try {
      if (nextDisabled) window.localStorage.setItem(OWNER_OPT_OUT_KEY, "true");
      else window.localStorage.removeItem(OWNER_OPT_OUT_KEY);
    } catch {
      // The control still applies for the current page when storage is unavailable.
    }
    if (nextDisabled) clearAnalyticsCookies();
    setDisabled(nextDisabled);
    window.dispatchEvent(new CustomEvent("launchset:owner-analytics", { detail: nextDisabled }));
  };

  if (disabled === null) return null;

  return (
    <div className={styles.control} data-disabled={disabled ? "true" : "false"}>
      <div>
        <span>{disabled ? "NOT BEING MEASURED" : "STANDARD COOKIE CHOICE APPLIES"}</span>
        <strong>{disabled ? "Analytics is disabled on this device." : "This device is not separately excluded."}</strong>
      </div>
      <button type="button" onClick={() => update(!disabled)}>
        {disabled ? "Enable on this device" : "Disable on this device"}
      </button>
    </div>
  );
}
