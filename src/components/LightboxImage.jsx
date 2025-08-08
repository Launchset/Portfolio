import { useState } from 'react';
import './LightboxImage.css';

export default function LightboxImage({ src, alt = 'Image' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className="lightbox-thumbnail"
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div className="lightbox-overlay" onClick={() => setIsOpen(false)}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setIsOpen(false)}>
              &times;
            </button>
            <img src={src} alt={alt} className="lightbox-full" />
          </div>
        </div>
      )}
    </>
  );
}
