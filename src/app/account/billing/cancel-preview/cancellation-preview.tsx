"use client";

import { useState } from "react";
import ClientBillingPage from "@/src/features/portal/client-billing-page";
import ClientContractPage from "@/src/features/portal/client-contract-page";
import ClientDashboard from "@/src/features/portal/client-dashboard";
import styles from "./preview.module.css";

type PreviewStep = "account" | "stripe" | "complete";
type PreviewScreen = "overview" | "contract" | "billing";

const previewRoutes = {
  overview: "/account/billing/cancel-preview",
  contract: "/account/billing/cancel-preview?screen=contract",
  billing: "/account/billing/cancel-preview?screen=billing",
};

const cancellationReasons = [
  "It’s too expensive",
  "I’m switching to a different service",
  "I don’t use the service enough",
  "Other reason",
] as const;

export default function CancellationPreview({
  initialScreen,
}: {
  initialScreen: PreviewScreen;
}) {
  const [step, setStep] = useState<PreviewStep>("account");
  const [screen, setScreen] = useState<PreviewScreen>(initialScreen);
  const [reason, setReason] = useState("");

  const reset = () => {
    setReason("");
    setStep("account");
    setScreen("overview");
  };

  return (
    <main className={styles.page}>
      <PreviewControls step={step} onReset={reset} />

      {step === "stripe" ? (
        <StripeCancellation
          reason={reason}
          setReason={setReason}
          onBack={() => setStep("account")}
          onConfirm={() => {
            setScreen("overview");
            setStep("complete");
          }}
        />
      ) : screen === "contract" ? (
        <ClientContractPage
          account={{ email: "mason@example.com", name: "Mason" }}
          contract={{
            action: <button type="button">View signed contract</button>,
            signedDate: "01/08/2026",
            status: "signed",
            title: "Website maintenance agreement",
          }}
          routes={previewRoutes}
        />
      ) : screen === "billing" ? (
        <ClientBillingPage
          account={{ email: "mason@example.com", name: "Mason" }}
          billing={{
            action: (
              <button type="button" onClick={() => setStep("stripe")}>
                Cancel billing
              </button>
            ),
            amount: "£50.00",
            periodLabel: "Next bill",
            periodValue: "30/09/2026",
            status: "Active",
          }}
          invoices={[]}
          routes={previewRoutes}
        />
      ) : (
        <ClientDashboard
          account={{ email: "mason@example.com", name: "Mason" }}
          billing={{
            amount: "£50.00",
            complete: true,
            periodLabel: step === "complete" ? "Ends" : "Next bill",
            periodValue: "30/09/2026",
            status: step === "complete" ? "Cancelling" : "Active",
          }}
          billingAction={
            step === "complete" ? (
              <button type="button" onClick={reset}>
                Run preview again
              </button>
            ) : (
              <button type="button" onClick={() => setStep("stripe")}>
                Cancel billing
              </button>
            )
          }
          billingNotice={
            step === "complete"
              ? "Your maintenance cancellation has been scheduled."
              : null
          }
          clientName="Mason"
          contract={{
            action: <button type="button">View contract</button>,
            signed: true,
            signedDate: "01/08/2026",
          }}
          invoices={[]}
          routes={previewRoutes}
        />
      )}
    </main>
  );
}

function PreviewControls({
  step,
  onReset,
}: {
  step: PreviewStep;
  onReset: () => void;
}) {
  return (
    <aside className={styles.previewControls}>
      <div>
        <strong>LOCAL PREVIEW</strong>
        <span>Test data only</span>
      </div>
      <nav aria-label="Cancellation preview steps">
        <span data-active={step === "account"}>Account</span>
        <i>→</i>
        <span data-active={step === "stripe"}>Stripe</span>
        <i>→</i>
        <span data-active={step === "complete"}>Scheduled</span>
      </nav>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </aside>
  );
}

function StripeCancellation({
  reason,
  setReason,
  onBack,
  onConfirm,
}: {
  reason: string;
  setReason: (reason: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <section
      className={styles.stripeStage}
      aria-label="Representative Stripe cancellation screen"
    >
      <div className={styles.stripePage}>
        <header className={styles.stripeHeader}>
          <div className={styles.stripeLaunchset}>L</div>
          <strong>Launchset</strong>
          <span>TEST MODE</span>
        </header>

        <p className={styles.stripeDisclosure}>
          Representative preview — Stripe controls the live screen.
        </p>
        <button className={styles.stripeBack} type="button" onClick={onBack}>
          ← Back to Launchset
        </button>
        <h1>Cancel your subscription</h1>
        <p className={styles.stripeIntro}>
          Your subscription will remain active until the end of your current
          billing period.
        </p>

        <article className={styles.planCard}>
          <div>
            <strong>Launchset monthly maintenance</strong>
            <span>£50.00 per month</span>
          </div>
          <div>
            <small>ACCESS UNTIL</small>
            <strong>30 Sep 2026</strong>
          </div>
        </article>

        <fieldset className={styles.reasons}>
          <legend>Why are you cancelling?</legend>
          {cancellationReasons.map((item) => (
            <label key={item}>
              <input
                type="radio"
                name="reason"
                value={item}
                checked={reason === item}
                onChange={(event) => setReason(event.target.value)}
              />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>

        <div className={styles.stripeSummary}>
          <strong>What happens when you cancel</strong>
          <p>
            You can continue using your maintenance service until 30 September
            2026. You won&apos;t be charged again after that date, and no
            prorated refund is created.
          </p>
        </div>

        <button
          className={styles.confirmCancel}
          type="button"
          disabled={!reason}
          onClick={onConfirm}
        >
          Cancel subscription
        </button>
        <button className={styles.keepPlan} type="button" onClick={onBack}>
          Keep subscription
        </button>
        <footer>
          Powered by <strong>stripe</strong> · Privacy · Terms
        </footer>
      </div>
    </section>
  );
}
