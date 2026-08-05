"use client";

import { FormEvent, PointerEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./sign.module.css";

export default function SignaturePad({ contractId, defaultName }: { contractId: string; defaultName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const drawnRef = useRef(false);
  const [signerName, setSignerName] = useState(defaultName);
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const snapshot = drawnRef.current ? canvas.toDataURL("image/png") : null;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.scale(ratio, ratio);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 2.4;
      context.strokeStyle = "#102018";
      if (snapshot) {
        const image = new Image();
        image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
        image.src = snapshot;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    drawingRef.current = true;
    drawnRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = event.currentTarget.getContext("2d");
    const current = point(event);
    context?.beginPath();
    context?.moveTo(current.x, current.y);
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const current = point(event);
    const context = event.currentTarget.getContext("2d");
    context?.lineTo(current.x, current.y);
    context?.stroke();
  };

  const stop = (event: PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    drawnRef.current = false;
    setMessage("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!drawnRef.current) {
      setMessage("Please draw your signature in the box.");
      return;
    }
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/contracts/${contractId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature: canvasRef.current?.toDataURL("image/png"), signerName, agreed }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setMessage(result.error ?? "We could not sign the contract.");
      setBusy(false);
      return;
    }
    router.push("/account?contract=signed");
    router.refresh();
  };

  return (
    <form className={styles.signForm} onSubmit={submit}>
      <label htmlFor="signer-name">Your full legal name</label>
      <input id="signer-name" maxLength={120} onChange={(event) => setSignerName(event.target.value)} required value={signerName} />
      <div className={styles.padHeader}><label>Draw your signature</label><button onClick={clear} type="button">Clear</button></div>
      <canvas
        aria-label="Signature drawing area"
        className={styles.canvas}
        onPointerCancel={stop}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        ref={canvasRef}
      />
      <label className={styles.agreement}>
        <input checked={agreed} onChange={(event) => setAgreed(event.target.checked)} required type="checkbox" />
        <span>I have read this contract and agree that this electronic signature represents my legal signature.</span>
      </label>
      {message && <p aria-live="polite" className={styles.message}>{message}</p>}
      <button className={styles.submit} disabled={busy} type="submit">{busy ? "Signing contract…" : "Sign contract"}</button>
    </form>
  );
}
