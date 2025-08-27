import { useEffect, useState } from "react";
import { setTheme as saveThemeCookie, getTheme, clearTheme } from "./cookies";

import SiteBackground from "./components/SiteBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import About from "./components/About";
import Footer from "./components/Footer";

/* ===== Consent cookie helpers (local, no deps) ===== */
const CONSENT_NAME = "consent"; // 'granted' | 'denied'
const setConsent = (value) => {
  const d = new Date();
  d.setTime(d.getTime() + 180 * 24 * 60 * 60 * 1000); // 180 days
  document.cookie = `${CONSENT_NAME}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
};
const getConsent = () => {
  const row = document.cookie.split("; ").find((r) => r.startsWith(`${CONSENT_NAME}=`));
  return row ? row.split("=")[1] : undefined;
};

function App() {
  const [theme, setTheme] = useState("light");
  const [consent, setConsentState] = useState(getConsent()); // undefined | 'granted' | 'denied'
  const [showControls, setShowControls] = useState(true);     // 👈 controls visibility

  // Load theme from cookie only for display; we still won't WRITE non-essential cookies unless consent=granted
  useEffect(() => {
    const saved = getTheme();
    if (saved) setTheme(saved);
  }, []);

  const handleTheme = (val) => {
    // Only write non-essential cookies if user granted consent
    if (consent === "granted") {
      saveThemeCookie(val);
    }
    setTheme(val);
  };

  const handleClearTheme = () => {
    clearTheme();
    setTheme("light");
    setShowControls(false); // 👈 hide the bottom-right popup after Clear
  };

  // When user accepts consent, this is where you'd lazy-load any analytics
  const onAcceptConsent = () => {
    setConsent("granted");
    setConsentState("granted");
    // loadAnalytics() // e.g. GA/Pixel
  };

  const onDeclineConsent = () => {
    setConsent("denied");
    setConsentState("denied");
    clearTheme();
  };

  return (
    <>
      <SiteBackground />
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <Contact />
        <About />
      </main>
      <Footer />

      {/* Floating example theme control (hide after Clear) */}
      {showControls && (
        <ThemeControls theme={theme} onChange={handleTheme} onClear={handleClearTheme} />
      )}

      {/* Cookie consent banner (shown only if not decided yet) */}
      {consent === undefined && (
        <CookieConsentBanner onAccept={onAcceptConsent} onDecline={onDeclineConsent} />
      )}
    </>
  );
}

/* ===== Cookie Consent Banner ===== */
function CookieConsentBanner({ onAccept, onDecline }) {
  return (
    <div style={bar.wrap} role="region" aria-label="Cookie consent">
      <div style={bar.card}>
        <div style={bar.text}>
          We use cookies to improve your experience. Click **Accept** to allow non-essential cookies
          (like preferences & analytics). You can change this later.
        </div>
        <div style={bar.actions}>
          <button style={bar.decline} onClick={onDecline}>Decline</button>
          <button style={bar.accept} onClick={onAccept}>Accept</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Optional Theme Controls (demo of a non-essential cookie) ===== */
function ThemeControls({ theme, onChange, onClear }) {
  return (
    <div style={controls.wrap} aria-live="polite">
      <div style={controls.card}>
        <div style={controls.row}>
          <span style={controls.label}>Theme</span>
          <div style={controls.buttons}>
            <button
              style={{ ...controls.btn, ...(theme === "light" ? controls.btnActive : {}) }}
              onClick={() => onChange("light")}
              aria-pressed={theme === "light"}
            >
              Light
            </button>
            <button
              style={{ ...controls.btn, ...(theme === "dark" ? controls.btnActive : {}) }}
              onClick={() => onChange("dark")}
              aria-pressed={theme === "dark"}
            >
              Dark
            </button>
          </div>
        </div>
        <div style={controls.footerRow}>
          <small style={controls.note}>Theme stored only if consent is accepted</small>
          <button style={controls.clear} onClick={onClear}>Clear</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Inline styles ===== */
const bar = {
  wrap: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    padding: "12px",
  },
  card: {
    width: "min(960px, 96vw)",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    borderRadius: "12px",
    padding: "12px 16px",
  },
  text: { color: "#0a2b1a", fontSize: "0.95rem", lineHeight: 1.35, flex: 1 },
  actions: { display: "flex", gap: "10px" },
  decline: {
    border: "1px solid #cde8d7",
    background: "#f8fffb",
    padding: "8px 14px",
    borderRadius: "999px",
    cursor: "pointer",
  },
  accept: {
    border: "1px solid #00703c",
    background: "#00703c",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 600,
  },
};

const controls = {
  wrap: { position: "fixed", right: 16, bottom: 84, zIndex: 999 },
  card: {
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    borderRadius: "14px",
    padding: "12px 14px",
    minWidth: 240,
  },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  label: { fontSize: "0.95rem", fontWeight: 600, color: "#0a2b1a" },
  buttons: { display: "flex", gap: 8 },
  btn: {
    fontSize: "0.9rem",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #cde8d7",
    background: "#f5fff9",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  btnActive: { background: "#00703c", color: "#fff", borderColor: "#00703c" },
  footerRow: { marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  note: { color: "#2c533f", opacity: 0.8 },
  clear: {
    fontSize: "0.85rem",
    border: "none",
    background: "transparent",
    textDecoration: "underline",
    color: "#005f32",
    cursor: "pointer",
    padding: 0,
  },
};

export default App;
