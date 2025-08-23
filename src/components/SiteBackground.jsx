import { useMemo } from "react";
import "../styles/global.css";

/**
 * Randomized-but-tasteful sitewide background.
 * - 6 blobs each load, constrained hues/sizes/positions so it looks good.
 * - Fixed behind all sections. Add your sections normally; they’ll sit on top.
 */
export default function SiteBackground() {
  const blobs = useMemo(() => {
    const W = window.innerWidth || 1200;
    const H = window.innerHeight || 800;

    // helpers
    const rand = (min, max) => Math.random() * (max - min) + min;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const hsl = (h, s, l, a = 1) => `hsla(${h} ${s}% ${l}% / ${a})`;

    // On-brand hue families
    const hueBands = [
      [290, 320],   // magenta→violet
      [195, 215],   // cyan→blue
      [150, 165],   // teal→green (brand-adjacent)
    ];

    // Generate 6 blobs with varied positions (some offscreen for depth)
    return Array.from({ length: 6 }).map((_, i) => {
      const [hMin, hMax] = pick(hueBands);
      const h1 = rand(hMin, hMax);
      const h2 = h1 + rand(-20, 12);

      // size: larger than viewport “hotspots” so glow feels natural
      const size = rand(420, 720); // px

      // positions: allow bleed outside edges so it’s not all center
      const left = rand(-0.25 * W, 0.85 * W);
      const top  = rand(-0.35 * H, 1.10 * H);

      // subtle per-blob drift delay & opacity variation
      const delay = `${(i * rand(0.8, 1.6)).toFixed(2)}s`;
      const opacity = rand(0.28, 0.5);

      // two radial gradients blended for richness
      const bg = `
        radial-gradient(closest-side at ${rand(25,75)}% ${rand(25,75)}%, ${hsl(h1, 90, 65)} 0%, ${hsl(h2, 80, 58)} 55%, transparent 62%),
        radial-gradient(closest-side at ${rand(25,75)}% ${rand(25,75)}%, ${hsl(h2+10, 85, 60)} 0%, ${hsl(h1-10, 75, 55)} 55%, transparent 62%)
      `;

      return {
        key: i,
        style: {
          left: `${left}px`,
          top: `${top}px`,
          width: `${size}px`,
          height: `${size}px`,
          background: bg,
          animationDelay: delay,
          opacity,
        },
      };
    });
  }, []); // reroll on reload

  return (
    <div className="site-bg" aria-hidden="true">
      {blobs.map(({ key, style }) => (
        <div key={key} className="bg-blob" style={style} />
      ))}
      <div className="bg-grain" />
      <div className="bg-vignette" />
    </div>
  );
}
