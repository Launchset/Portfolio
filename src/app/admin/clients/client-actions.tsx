"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../admin.module.css";

type ClientActionsProps = {
  clientId: string;
  clientName: string;
  canCancelBilling: boolean;
  cancellationScheduled: boolean;
  removalBlockReason?: string;
};

export default function ClientActions({ clientId, clientName, canCancelBilling, cancellationScheduled, removalBlockReason }: ClientActionsProps) {
  const [busy, setBusy] = useState(false);

  const removeClient = async () => {
    if (!window.confirm(`Remove ${clientName} from Launchset? Their contracts and billing history will be archived, not erased.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        window.alert(payload.error ?? "The client could not be removed.");
        return;
      }
      window.location.reload();
    } catch {
      window.alert("The client could not be removed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const cancelBilling = async () => {
    if (!window.confirm(`Cancel billing for ${clientName}? The subscription will end after the current paid period.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/billing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        window.alert(payload.error ?? "Stripe billing could not be cancelled.");
        return;
      }
      window.location.reload();
    } catch {
      window.alert("Stripe billing could not be cancelled. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return <details className={styles.actionMenu}>
    <summary aria-label={`Manage ${clientName}`} title="Manage client"><span>•••</span></summary>
    <div>
      <Link href={`/admin/clients/${clientId}`}>View client</Link>
      <Link href={`/admin/payments/${clientId}`}>View payment</Link>
      {(canCancelBilling || cancellationScheduled) && <button className={styles.cancelAction} disabled={busy || cancellationScheduled} onClick={cancelBilling} type="button">{cancellationScheduled ? "Cancellation scheduled" : "Cancel billing"}</button>}
      <button disabled={busy || Boolean(removalBlockReason)} onClick={removeClient} title={removalBlockReason} type="button">{busy ? "Updating…" : "Remove client"}</button>
    </div>
  </details>;
}
