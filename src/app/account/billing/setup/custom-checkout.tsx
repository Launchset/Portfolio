"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import styles from "./setup.module.css";

const confirmationTimeoutMs = 60_000;

const appearance: Appearance = {
  theme: "night",
  inputs: "spaced",
  labels: "above",
  variables: {
    colorPrimary: "#25D38A",
    colorBackground: "#11191F",
    colorText: "#F7FAF8",
    colorTextSecondary: "#C7D0CC",
    colorTextPlaceholder: "#9AA7A1",
    colorDanger: "#E78282",
    colorIcon: "#D5DED9",
    colorIconCheckmark: "#06110C",
    accessibleColorOnColorPrimary: "#06110C",
    fontFamily: "Inter, Arial, sans-serif",
    fontSizeBase: "16px",
    spacingUnit: "4px",
    borderRadius: "2px",
    buttonBorderRadius: "2px",
    buttonColorBackground: "#25D38A",
    logoColor: "light",
  },
  rules: {
    ".Input": {
      border: "1px solid #27343A",
      boxShadow: "none",
    },
    ".Input:hover": {
      borderColor: "#3D4E55",
    },
    ".Input:focus": {
      borderColor: "#25D38A",
      boxShadow: "0 0 0 1px #25D38A",
    },
    ".Label": {
      color: "#E5ECE8",
      fontWeight: "600",
    },
    ".Text": {
      color: "#D5DED9",
      lineHeight: "1.5",
    },
    ".CheckboxLabel": {
      color: "#F7FAF8",
      fontWeight: "600",
    },
    ".CheckboxInput": {
      backgroundColor: "#080D12",
      border: "2px solid #AAB8B2",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
    },
    ".CheckboxInput:hover": {
      borderColor: "#F7FAF8",
    },
    ".CheckboxInput:focus-visible": {
      borderColor: "#25D38A",
      boxShadow: "0 0 0 2px rgba(37,211,138,0.35)",
    },
    ".CheckboxInput--checked": {
      backgroundColor: "#25D38A",
      borderColor: "#25D38A",
    },
    ".Link": {
      color: "#54E7A9",
      fontWeight: "600",
    },
    ".Tab": {
      border: "1px solid #27343A",
      boxShadow: "none",
    },
    ".Tab--selected": {
      borderColor: "#25D38A",
      boxShadow: "0 0 0 1px #25D38A",
    },
  },
};

function PaymentForm() {
  const result = useCheckoutElements();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saveForFasterCheckout, setSaveForFasterCheckout] = useState(false);

  if (result.type === "loading") return <div className={styles.loading}>Loading secure payment form…</div>;
  if (result.type === "error") return <div className={styles.error}>{result.error.message}</div>;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");

    let timeoutId: number | undefined;
    try {
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error("confirmation_timeout")), confirmationTimeoutMs);
      });
      const confirmation = await Promise.race([
        result.checkout.confirm(),
        timeout,
      ]);

      if (confirmation.type === "error") {
        setMessage(confirmation.error.message);
        return;
      }

      // Stripe normally redirects to the Checkout Session return URL. This is
      // a fallback for payment methods that complete without a redirect.
      window.location.replace("/account?billing=success");
    } catch (error) {
      setMessage(error instanceof Error && error.message === "confirmation_timeout"
        ? "Stripe did not finish confirming the payment. Check for a Stripe or bank verification prompt, then try again."
        : error instanceof Error
          ? error.message
          : "Stripe could not confirm the payment. Please try again.");
    } finally {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      setBusy(false);
    }
  };

  return <form className={styles.paymentForm} onSubmit={submit}>
    <div className={styles.checkoutGuide}>
      <strong>Secure monthly payment</strong>
      <p>Stripe securely keeps this payment method for your monthly maintenance subscription. Launchset does not receive or store your card details.</p>
      <p>Additional information is optional unless Stripe marks a field as required. You can change the country and mobile dialling code before paying.</p>
    </div>
    <PaymentElement options={{
      layout: { type: "accordion", defaultCollapsed: false, radios: "never", spacedAccordionItems: false },
      fields: { billingDetails: { address: "if_required" } },
      wallets: { link: saveForFasterCheckout ? "auto" : "never" },
    }} />
    <label className={styles.linkChoice}>
      <input
        className={styles.linkChoiceInput}
        checked={saveForFasterCheckout}
        disabled={busy}
        onChange={(event) => setSaveForFasterCheckout(event.target.checked)}
        type="checkbox"
      />
      <span aria-hidden="true" className={styles.linkChoiceBox}>
        <svg fill="none" viewBox="0 0 16 16"><path d="m3.5 8.3 2.8 2.8 6.2-6.2" /></svg>
      </span>
      <span className={styles.linkChoiceCopy}>
        <strong>Save for faster checkout</strong>
        <small>Optional — use Stripe Link to reuse your details in the future.</small>
      </span>
    </label>
    {saveForFasterCheckout && <p className={styles.linkDetails}>Stripe may ask for your email and mobile number to create or sign in to Link. You can turn this option off before paying.</p>}
    {message && <p className={styles.error} role="alert">{message}</p>}
    <button aria-busy={busy} disabled={busy || !result.checkout.canConfirm} type="submit">{busy ? "Confirming with Stripe…" : "Start monthly maintenance"}</button>
    <p className={styles.secureNote}>Payment details are encrypted and handled directly by Stripe.</p>
  </form>;
}

export default function LaunchsetCustomCheckout({ publishableKey }: { publishableKey: string }) {
  const stripe = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  const [clientSecret] = useState(() => fetch("/api/billing/checkout", { method: "POST" }).then(async (response) => {
    const payload = await response.json() as { clientSecret?: string; error?: string };
    if (!response.ok || !payload.clientSecret) throw new Error(payload.error ?? "Stripe Checkout could not be opened.");
    return payload.clientSecret;
  }));
  const options = useMemo(() => ({
    clientSecret,
    elementsOptions: { appearance, loader: "auto" as const },
  }), [clientSecret]);

  return <CheckoutElementsProvider stripe={stripe} options={options}><PaymentForm /></CheckoutElementsProvider>;
}
