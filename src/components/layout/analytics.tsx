"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "launchset-cookie-preference";
const OWNER_OPT_OUT_KEY = "launchset-owner-analytics-disabled";
const SIX_MONTHS = 1000 * 60 * 60 * 24 * 180;
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-HX8DBNS3QQ";

type WebVitalMetric = {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating: string;
  navigationType: string;
};

function isLocalHostname(hostname: string) {
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(hostname)) return true;
  if (hostname.endsWith(".workers.dev")) return true;
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
  const measurementReady = useRef(false);
  const pendingVitals = useRef(new Map<string, WebVitalMetric>());

  useEffect(() => {
    measurementReady.current = allowed && ready;
    if (measurementReady.current && hasCurrentAnalyticsConsent() && !hasOwnerOptOut()) {
      for (const metric of pendingVitals.current.values()) {
        window.gtag?.("event", "web_vital", {
          metric_id: metric.id,
          metric_name: metric.name,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
          navigation_type: metric.navigationType,
          non_interaction: true,
        });
      }
      pendingVitals.current.clear();
    }
  }, [allowed, ready]);

  const reportWebVital = useCallback((metric: WebVitalMetric) => {
    if (!measurementReady.current || !hasCurrentAnalyticsConsent() || hasOwnerOptOut()) {
      pendingVitals.current.set(metric.name, metric);
      return;
    }
    window.gtag?.("event", "web_vital", {
      metric_id: metric.id,
      metric_name: metric.name,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
      navigation_type: metric.navigationType,
      non_interaction: true,
    });
  }, []);

  useReportWebVitals(reportWebVital);

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
      if (!granted) {
        pendingVitals.current.clear();
        setReady(false);
      }
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
      if (!granted) {
        pendingVitals.current.clear();
        setReady(false);
      }
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

  useEffect(() => {
    if (!allowed || !ready || !GA_ID) return;

    const sentDepths = new Set<number>();
    let scrollFrame = 0;
    const sendEvent = (name: string, parameters: Record<string, string | number | boolean>) => {
      if (!measurementReady.current || !hasCurrentAnalyticsConsent() || hasOwnerOptOut()) return;
      window.gtag?.("event", name, parameters);
    };

    const linkLocation = (link: HTMLAnchorElement) => {
      if (link.closest("footer")) return "footer";
      if (link.closest("nav")) return "navigation";
      if (link.closest("#contact")) return "contact_section";
      if (link.closest("#work")) return "work_section";
      return "page_content";
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const location = linkLocation(link);

      if (href.startsWith("mailto:")) {
        sendEvent("contact_click", { contact_method: "email", link_location: location });
        return;
      }
      if (href.includes("linkedin.com")) {
        sendEvent("contact_click", { contact_method: "linkedin", link_location: location });
        return;
      }
      if (href.startsWith("/work/tools/")) {
        sendEvent("architecture_open", {
          tool: href.split("/work/tools/")[1]?.split(/[?#]/)[0] ?? "unknown",
          link_location: location,
        });
        return;
      }
      if (href === "#work" || href === "/work" || href.startsWith("/work#")) {
        sendEvent("portfolio_open", { link_location: location });
        return;
      }
      if (href === "#contact" || href === "/#contact") {
        sendEvent("start_project_click", { link_location: location });
      }
    };

    const measureScroll = () => {
      scrollFrame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const depth = Math.round((window.scrollY / scrollable) * 100);
      for (const threshold of [50, 90]) {
        if (depth >= threshold && !sentDepths.has(threshold)) {
          sentDepths.add(threshold);
          sendEvent("scroll_depth", { percent_scrolled: threshold });
        }
      }
    };

    const handleScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(measureScroll);
    };
    const handleHeroComplete = () => sendEvent("hero_sequence_complete", { sequence: "design_to_automation" });

    document.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("launchset:hero-complete", handleHeroComplete);
    measureScroll();
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("launchset:hero-complete", handleHeroComplete);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    };
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
