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
      <p className={styles.finePrint}>No password to remember. Magic links are single-use and verify ownership of the email address.</p>
    </div>
  );
}

function ProviderMark() {
  return <span aria-hidden="true" className={`${styles.providerMark} ${styles.google}`}>G</span>;
}
