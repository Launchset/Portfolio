"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../admin.module.css";

type PaymentActionsProps = {
  clientId: string;
  clientName: string;
  hasSubscription: boolean;
  frozen: boolean;
  cancelling?: boolean;
};

export default function PaymentActions({ clientId, clientName, hasSubscription, frozen, cancelling = false }: PaymentActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const changeCollection = async () => {
    const action = frozen ? "unfreeze" : "freeze";
    const question = frozen
      ? `Unfreeze ${clientName}? Stripe will resume collection on the next scheduled billing date.`
      : `Freeze ${clientName}? New invoices will be voided until you unfreeze the account.`;
    if (!window.confirm(question)) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/billing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        window.alert(payload.error ?? "Stripe billing could not be updated.");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Stripe billing could not be updated. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!hasSubscription) return <span className={styles.paymentActionUnavailable}>Not available</span>;
  if (cancelling) return <span className={styles.paymentActionUnavailable}>Cancellation scheduled</span>;
  return <button className={frozen ? styles.unfreezeButton : styles.freezeButton} disabled={busy} onClick={changeCollection} type="button">
    {busy ? "Updating…" : frozen ? "Unfreeze" : "Freeze"}
  </button>;
}
