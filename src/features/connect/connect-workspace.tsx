"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ConnectBusiness, ConnectEvent } from "./types";
import styles from "./connect.module.css";

type Inbox = { businesses: ConnectBusiness[]; events: ConnectEvent[]; admin: boolean;
  configuration: { metaReady: boolean; telegramReady: boolean; accountAccessReady: boolean } | null };
type BusinessForm = Omit<ConnectBusiness, "created_at" | "updated_at" | "last_checked_at" | "enabled"> & { enabled: boolean };
const emptyBusiness: BusinessForm = { id: "", name: "", waba_id: "", phone_number_id: "", member_email: "", email_to: "", telegram_chat_id: "", route_label: "General enquiries", enabled: false };
const statusLabels = { new: "New", in_progress: "In progress", done: "Done" };

function EventItem({ event, mutate, busy }: { event: ConnectEvent; mutate: (url: string, method: string, body?: unknown) => Promise<boolean>; busy: boolean }) {
  const [route, setRoute] = useState(event.route_label);
  const [status, setStatus] = useState(event.status);
  return <article className={styles.event}>
    <div><span className={styles.kicker}>{event.business_name}</span><h3>New WhatsApp Business message</h3>
      <p>{new Date(event.received_at).toLocaleString("en-GB", { timeZone: "UTC" })} UTC · {event.message_type}</p>
      <p className={styles.delivery}>{event.deliveries || "Website inbox only"}</p></div>
    <form className={styles.eventControls} onSubmit={async (e) => { e.preventDefault(); await mutate(`/api/connect/events/${event.id}`, "PATCH", { route_label: route, status }); }}>
      <label>Route to<input value={route} onChange={(e) => setRoute(e.target.value)} required maxLength={100} /></label>
      <label>Status<select value={status} onChange={(e) => setStatus(e.target.value as ConnectEvent["status"])}>
        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <button disabled={busy} type="submit">Save</button>
      {event.deliveries?.includes("failed") && <button disabled={busy} type="button" onClick={() => mutate(`/api/connect/events/${event.id}/retry`, "POST")}>Retry failed alerts</button>}
    </form>
  </article>;
}

export default function ConnectWorkspace({ initial, email }: { initial: Inbox; email: string }) {
  const [inbox, setInbox] = useState(initial);
  const [form, setForm] = useState<BusinessForm | null>(null);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const reload = useCallback(async () => {
    const response = await fetch("/api/connect/inbox", { cache: "no-store" });
    if (!response.ok) throw new Error("Your inbox could not be refreshed. Sign in again if your session has expired.");
    setInbox(await response.json());
  }, []);
  useEffect(() => { const timer = setInterval(() => { reload().catch((e) => setMessage(e.message)); }, 30000); return () => clearInterval(timer); }, [reload]);
  async function mutate(url: string, method: string, body?: unknown) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "The change could not be saved.");
      await reload(); setMessage("Saved."); return true;
    } catch (e) { setMessage(e instanceof Error ? e.message : "The change could not be saved."); return false; }
    finally { setBusy(false); }
  }
  const events = inbox.events.filter((event) => !filter || event.business_id === filter);
  return <main className={styles.workspace}>
    <header className={styles.topbar}><Link href="/launchset-connect">Launchset <strong>Connect</strong></Link><span>{email}</span>{inbox.admin && <Link href="/admin">Admin</Link>}</header>
    <div className={styles.shell}>
      <header className={styles.heading}><div><span className={styles.kicker}>CONNECTED MESSAGING</span><h1>Your message alerts.</h1>
        <p>Track new messages, route the work and check alert delivery. Read and reply to the conversation in WhatsApp Business.</p></div>
        <button disabled={busy} onClick={() => reload().catch((e) => setMessage(e.message))}>Refresh inbox</button></header>
      {message && <p role="status" className={styles.notice}>{message}</p>}
      <section className={styles.panel}><div className={styles.sectionHeading}><h2>Businesses</h2>{inbox.admin && <button onClick={() => setForm({ ...emptyBusiness })}>Add business</button>}</div>
        {inbox.businesses.length === 0 ? <p>No businesses connected yet.{!inbox.admin && " Ask Launchset to add this email to your business connection."}</p> :
          <div className={styles.businessGrid}>{inbox.businesses.map((business) => <article className={styles.business} key={business.id}>
            <div><h3>{business.name}</h3><span className={business.enabled ? styles.live : styles.paused}>{business.enabled ? "Enabled" : "Paused"}</span></div>
            <p>Route: {business.route_label}</p><p>{business.email_to ? "Email alerts" : "Email off"} · {business.telegram_chat_id ? "Telegram alerts" : "Telegram off"}</p>
            <p>{business.last_checked_at ? "Meta account access checked" : "Meta account access needs checking"}</p>
            {!inbox.admin && <button disabled={busy} onClick={() => mutate(`/api/connect/businesses/${business.id}/check`, "POST")}>Check Meta access</button>}
            {inbox.admin && <>
              <div className={styles.actions}><button disabled={busy} onClick={() => setForm({ ...business, enabled: Boolean(business.enabled) })}>Edit</button>
                <button disabled={busy || !inbox.configuration?.accountAccessReady} onClick={() => mutate(`/api/connect/businesses/${business.id}/check`, "POST")}>Check Meta access</button>
                <button disabled={busy} onClick={() => { if (confirm(`Remove ${business.name} and delete its stored alerts?`)) mutate(`/api/connect/businesses?id=${business.id}`, "DELETE"); }}>Remove</button></div></>}
          </article>)}</div>}
      </section>
      {form && inbox.admin && <section className={styles.panel}><h2>{form.id ? "Edit business" : "Add business"}</h2>
        <form className={styles.form} onSubmit={async (e) => { e.preventDefault(); if (await mutate("/api/connect/businesses", "POST", form)) setForm(null); }}>
          {([ ["name", "Business name"], ["waba_id", "WhatsApp Business Account ID"], ["phone_number_id", "Meta phone number ID"], ["member_email", "Business member email (optional)"],
            ["email_to", "Alert email (optional)"], ["telegram_chat_id", "Telegram chat ID (optional)"], ["route_label", "Default routing label"] ] as const).map(([name, label]) =>
              <label key={name}>{label}<input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                type={name.includes("email") || name === "email_to" ? "email" : "text"} required={["name", "waba_id", "phone_number_id", "route_label"].includes(name)}
                disabled={Boolean(form.id) && (name === "waba_id" || name === "phone_number_id")} maxLength={name.includes("email") || name === "email_to" ? 254 : 100} /></label>)}
          <label className={styles.checkbox}><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />Enable incoming message alerts</label>
          <p className={styles.formHelp}>Save a new business paused, check its Meta account access, then enable it. The member email controls who can see this business’s inbox. Email and Telegram receive a generic alert with no customer details. Routing labels organise work inside this inbox.</p>
          <div className={styles.actions}><button disabled={busy} type="submit">{busy ? "Saving…" : "Save business"}</button><button type="button" onClick={() => setForm(null)}>Cancel</button></div>
        </form></section>}
      <section className={styles.panel}><div className={styles.sectionHeading}><h2>Inbox <span>{events.filter((e) => e.status === "new").length} new</span></h2>
        <label>Business<select aria-label="Filter inbox by business" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All your businesses</option>
          {inbox.businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select></label></div>
        {events.length ? events.map((event) => <EventItem event={event} key={`${event.id}:${event.status}:${event.route_label}`} mutate={mutate} busy={busy} />) : <div className={styles.empty}><h3>No message alerts yet</h3><p>Incoming messages appear here once your business connection and Meta webhook are enabled.</p></div>}
        <p className={styles.formHelp}>The inbox refreshes every 30 seconds and shows the latest 100 alerts. Alert records are kept for 30 days.</p>
      </section>
      {inbox.admin && <details className={styles.panel}><summary>Connection setup</summary><p>Webhook configuration: {inbox.configuration?.metaReady ? "Ready" : "Needs secrets"} · Meta account access: {inbox.configuration?.accountAccessReady ? "Ready" : "Needs token and API version"} · Telegram bot: {inbox.configuration?.telegramReady ? "Ready" : "Needs token"}</p>
        <p>Meta callback: <code>/api/connect/webhooks/whatsapp</code>. Subscribe to incoming <code>messages</code> events. Store credentials as Worker secrets; never enter them in this form.</p></details>}
      <footer className={styles.footer}><Link href="/launchset-connect/privacy">Privacy</Link><Link href="/launchset-connect/terms">Terms</Link><a href="mailto:launchsetfreelancer@gmail.com">Support</a></footer>
    </div>
  </main>;
}
