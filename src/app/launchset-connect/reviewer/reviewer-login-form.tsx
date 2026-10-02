"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/src/lib/auth-client";
import loginStyles from "@/src/app/login/login.module.css";
import styles from "./reviewer.module.css";

export default function ReviewerLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const result = await authClient.signIn.email({ email, password, rememberMe: false });
      if (result.error) {
        setMessage("We could not sign you in. Check your email and password.");
        setPassword("");
      } else {
        window.location.assign("/launchset-connect/workspace");
      }
    } catch {
      setMessage("Sign-in is temporarily unavailable. Please try again.");
    } finally { setBusy(false); }
  }

  return <div className={loginStyles.card}>
    <form className={styles.form} onSubmit={signIn}>
      <label htmlFor="reviewer-email">Email address
        <input id="reviewer-email" type="email" autoComplete="username" required value={email}
          disabled={busy} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label htmlFor="reviewer-password">Password
        <input id="reviewer-password" type="password" autoComplete="current-password" required value={password}
          disabled={busy} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    {message && <p role="alert" className={loginStyles.message}>{message}</p>}
  </div>;
}
