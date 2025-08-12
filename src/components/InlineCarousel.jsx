import { useState } from 'react';
import './InlineCarousel.css';

export default function InlineCarousel({
  images = [],
  alt = '',
  ratio = '16 / 9',
  className = '',
  showDots = true,
  onChange,        // (index) => void  (optional)
  onImageClick,    // (index) => void  (NEW: tells parent which image was clicked)
}) {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;

  const goTo = (i) => {
    const ni = ((i % images.length) + images.length) % images.length;
    setIndex(ni);
    onChange?.(ni);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  return (
    <div className={`inline-carousel ${className}`} style={{ '--i': index }}>
      <div
        className="inline-track"
        style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="inline-slide" style={{ aspectRatio: ratio }}>
            <img
              src={src}
              alt={alt || `slide ${i + 1}`}
              onClick={() => onImageClick?.(i)}   // tell parent which image
              draggable="false"
            />
          </div>
        ))}
      </div>

      {/* Make these accessible; don't hide them with aria-hidden or inert */}
      <div className="inline-nav">
        <button className="inline-btn prev" onClick={prev} aria-label="Previous">
          &#10094;
        </button>
        <button className="inline-btn next" onClick={next} aria-label="Next">
          &#10095;
        </button>
      </div>

      {showDots && (
        <div className="inline-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`inline-dot ${i === index ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
