import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com https://*.stripe.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.stripe.com https://r.stripe.com https://m.stripe.network",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join("; ");

const cacheHeader = (value: string) => [{ key: "Cache-Control", value }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
        ],
      },
      {
        source: "/api/contracts/:id/file",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/projects/:path*",
        headers: cacheHeader("public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"),
      },
      {
        source: "/portfolio/:path*",
        headers: cacheHeader("public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"),
      },
      {
        source: "/founder-portrait.webp",
        headers: cacheHeader("public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"),
      },
      ...["favicon.ico", "apple-icon.png", "icon-192.png", "icon-512.png"].map((asset) => ({
        source: `/${asset}`,
        headers: cacheHeader("public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400"),
      })),
    ];
  },
};

export default nextConfig;
