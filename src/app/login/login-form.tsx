"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import styles from "./login.module.css";

type Provider = "google";

const providerLabels: Record<Provider, string> = {
  google: "Continue with Google",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const socialLogin = async (provider: Provider) => {
    setBusy(provider);
    setMessage("");
    const result = await authClient.signIn.social({
      provider,
      callbackURL: "/account",
      errorCallbackURL: "/login?error=provider",
    });
    if (result.error) {
      setMessage(result.error.message ?? `${providerLabels[provider]} is not configured yet.`);
      setBusy(null);
    }
  };

  const emailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy("email");
    setMessage("");
    const result = await authClient.signIn.magicLink({
      email,
      callbackURL: "/account",
      errorCallbackURL: "/login?error=magic-link",
    });
    if (result.error) {
      setMessage(result.error.message ?? "We could not send the link. Please try again.");
    } else {
      setMessage("Check your inbox. Your one-time verification link is valid for 15 minutes.");
      setEmail("");
    }
    setBusy(null);
  };

  return (
    <div className={styles.card}>
      <div className={styles.socialStack}>
        {(Object.keys(providerLabels) as Provider[]).map((provider) => (
          <button disabled={busy !== null} key={provider} onClick={() => socialLogin(provider)} type="button">
            <ProviderMark />
            <span>{busy === provider ? "Connecting…" : providerLabels[provider]}</span>
          </button>
        ))}
      </div>

      <div className={styles.divider}><span>or use a verified email</span></div>

      <form onSubmit={emailLogin}>
        <label htmlFor="login-email">Email address</label>
        <div className={styles.emailRow}>
          <input
            autoComplete="email"
            id="login-email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            type="email"
            value={email}
          />
          <button disabled={busy !== null} type="submit">{busy === "email" ? "Sending…" : "Email me a link"}</button>
        </div>
      </form>

      {message && <p aria-live="polite" className={styles.message}>{message}</p>}
    </div>
  );
}

function ProviderMark() {
  return (
    <span aria-hidden="true" className={styles.providerMark}>
      <svg viewBox="0 0 18 18" role="presentation">
        <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.614Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.909-2.258c-.806.54-1.836.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.955v2.332A9 9 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.963 10.706A5.41 5.41 0 0 1 3.681 9c0-.592.102-1.167.282-1.706V4.962H.955A9 9 0 0 0 0 9c0 1.452.347 2.827.955 4.038l3.008-2.332Z" />
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .955 4.962l3.008 2.332C4.672 5.165 6.656 3.58 9 3.58Z" />
      </svg>
    </span>
  );
}
