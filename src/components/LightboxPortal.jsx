import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./LightboxPortal.css";

export default function LightboxPortal({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (!images.length) return null;

  return createPortal(
    <div
      className="lb-overlay show"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="lb-content" onClick={(e) => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose} aria-label="Close">
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
