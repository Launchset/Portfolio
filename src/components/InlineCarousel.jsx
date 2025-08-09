import { useState } from 'react';
import './InlineCarousel.css';

export default function InlineCarousel({
  images = [],
  alt = '',
  ratio = '16 / 9',           // e.g. '16 / 9' or '9 / 19'
  className = '',
  showDots = true,
}) {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className={`inline-carousel ${className}`} style={{ '--i': index }}>
      <div className="inline-track" style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}>
        {images.map((src, i) => (
          <div key={i} className="inline-slide" style={{ aspectRatio: ratio }}>
            <img src={src} alt={alt || `slide ${i + 1}`} />
          </div>
        ))}
      </div>

      <div className="inline-nav" aria-hidden="true">
        <button className="inline-btn prev" onClick={prev} aria-label="Previous">&#10094;</button>
        <button className="inline-btn next" onClick={next} aria-label="Next">&#10095;</button>
      </div>

      {showDots && (
        <div className="inline-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`inline-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
