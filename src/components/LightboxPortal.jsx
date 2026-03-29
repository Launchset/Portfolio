import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./LightboxPortal.css";

export default function LightboxPortal({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setIndex((i) => (i + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setIndex((i) => (i - 1 + images.length) % images.length);
      }
      if (e.key === "Tab") {
        const focusableElements = overlayRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements?.length) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
      previousFocus?.focus?.();
    };
  }, [images.length, onClose]);

  if (!images.length) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="lb-overlay show"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Project image viewer"
    >
      <div className="lb-content" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeButtonRef}
          className="lb-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <button className="lb-nav prev" onClick={prev} aria-label="Previous">
          &#10094;
        </button>

        <img
          className="lb-img"
          src={images[index]}
          alt={`image ${index + 1}`}
          draggable="false"
        />

        <button className="lb-nav next" onClick={next} aria-label="Next">
          &#10095;
        </button>
      </div>
    </div>,
    document.body
  );
}
