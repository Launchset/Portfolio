"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "launchset-cookie-preference";
const OWNER_OPT_OUT_KEY = "launchset-owner-analytics-disabled";
const SIX_MONTHS = 1000 * 60 * 60 * 24 * 180;
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-HX8DBNS3QQ";

function isLocalHostname(hostname: string) {
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(hostname)) return true;
  if (hostname.endsWith(".local") || hostname.startsWith("127.")) return true;
  if (hostname.startsWith("10.") || hostname.startsWith("192.168.")) return true;
  const match = hostname.match(/^172\.(\d+)\./);
  return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}

function hasOwnerOptOut() {
  try {
    return window.localStorage.getItem(OWNER_OPT_OUT_KEY) === "true";
  } catch {
    return false;
  }
}

function hasCurrentAnalyticsConsent() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const saved = stored ? JSON.parse(stored) as { analytics?: "granted" | "denied"; updatedAt?: number } : null;
    const isCurrent = saved?.updatedAt && Date.now() - saved.updatedAt < SIX_MONTHS;
    return Boolean(isCurrent && saved?.analytics === "granted");
  } catch {
    return false;
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialCheck = window.setTimeout(() => {
      if (isLocalHostname(window.location.hostname) || hasOwnerOptOut()) {
        setAllowed(false);
        return;
      }
      setAllowed(hasCurrentAnalyticsConsent());
    }, 0);

    const updateConsent = (event: Event) => {
      const choice = (event as CustomEvent<"granted" | "denied">).detail;
      const granted = choice === "granted" && !isLocalHostname(window.location.hostname) && !hasOwnerOptOut();

      if (GA_ID) {
        (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = !granted;
      }
      window.gtag?.("consent", "update", {
        analytics_storage: choice,
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      setAllowed(granted);
      if (!granted) setReady(false);
    };

    const updateOwnerOptOut = () => {
      const granted = !isLocalHostname(window.location.hostname) && !hasOwnerOptOut() && hasCurrentAnalyticsConsent();
      (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = !granted;
      window.gtag?.("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      setAllowed(granted);
      if (!granted) setReady(false);
    };

    window.addEventListener("launchset:analytics-consent", updateConsent);
    window.addEventListener("launchset:owner-analytics", updateOwnerOptOut);
    return () => {
      window.clearTimeout(initialCheck);
      window.removeEventListener("launchset:analytics-consent", updateConsent);
      window.removeEventListener("launchset:owner-analytics", updateOwnerOptOut);
    };
  }, []);

  useEffect(() => {
    if (allowed && ready && GA_ID) {
      window.gtag?.("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [allowed, pathname, ready]);

  if (!GA_ID || !allowed) return null;

  return (
    <>
      <Script id="launchset-ga-consent" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});`}
      </Script>
      <Script
        id="launchset-ga-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
    </>
  );
}
