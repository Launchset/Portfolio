"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function AddClientForm() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const response = await fetch("/api/admin/clients", {
      method: "POST",
      body: new FormData(form),
    });
    const result = (await response.json()) as {
      error?: string;
      warning?: string;
    };
    if (!response.ok) {
      setMessage(result.error ?? "The client could not be added.");
      setBusy(false);
      return;
    }
    form.reset();
    setMessage(result.warning ?? "Client created and invitation sent.");
    setBusy(false);
    router.refresh();
  };

  return (
    <section className={styles.addPanel}>
      <button
        className={styles.addButton}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? "Close" : "Add client"}
      </button>
      {open && (
        <form className={styles.form} onSubmit={submit}>
          <div>
            <label htmlFor="client-name">Client name</label>
            <input id="client-name" name="name" required />
          </div>
          <div>
            <label htmlFor="client-email">Email</label>
            <input id="client-email" name="email" required type="email" />
          </div>
          <div>
            <label htmlFor="monthly-fee">Monthly maintenance (£)</label>
            <input
              id="monthly-fee"
              min="0"
              name="monthlyFee"
              required
              step="0.01"
              type="number"
            />
          </div>
          <div>
            <label htmlFor="contract-title">Contract title</label>
            <input
              defaultValue="Launchset service agreement"
              id="contract-title"
              name="title"
              required
            />
          </div>
          <div className={styles.file}>
            <label htmlFor="contract-file">Contract PDF</label>
            <input
              accept="application/pdf"
              id="contract-file"
              name="contract"
              required
              type="file"
            />
          </div>
          <details className={styles.placement}>
            <summary>Signature placement</summary>
            <p>
              PDF coordinates start at the bottom-left. Defaults place a 180 ×
              64 point signature on the lower-left of the last page.
            </p>
            <div className={styles.placementGrid}>
              <label>
                Page
                <input defaultValue="-1" name="signaturePage" type="number" />
                <small>-1 = last page</small>
              </label>
              <label>
                Left (x)
                <input
                  defaultValue="54"
                  min="0"
                  name="signatureX"
                  type="number"
                />
              </label>
              <label>
                Bottom (y)
                <input
                  defaultValue="54"
                  min="0"
                  name="signatureY"
                  type="number"
                />
              </label>
              <label>
                Width
                <input
                  defaultValue="180"
                  min="1"
                  name="signatureWidth"
                  type="number"
                />
              </label>
              <label>
                Height
                <input
                  defaultValue="64"
                  min="1"
                  name="signatureHeight"
                  type="number"
                />
              </label>
            </div>
          </details>
          {message && (
            <p aria-live="polite" className={styles.formMessage}>
              {message}
            </p>
          )}
          <button className={styles.submit} disabled={busy} type="submit">
            {busy ? "Creating client…" : "Create client and send invitation"}
          </button>
        </form>
      )}
    </section>
  );
}
