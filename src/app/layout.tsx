import type { Metadata } from "next";
import PublicSiteChrome from "@/src/components/layout/public-site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://launchset.dev"),
  title: "Launchset — Websites built to move business forward",
  description:
    "Distinctive websites and smart automations that save time, create value and move businesses forward.",
  applicationName: "Launchset",
  keywords: [
    "web design studio",
    "website development",
    "business automation",
    "internal tools",
    "digital systems",
    "Launchset",
  ],
  authors: [{ name: "Launchset", url: "https://launchset.dev" }],
  creator: "Launchset",
  publisher: "Launchset",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://launchset.dev",
    siteName: "Launchset",
    title: "Launchset — Digital design and automation studio",
    description:
      "Distinctive websites and useful automations designed to save time and create measurable value.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Launchset — Digital design and automation studio",
    description:
      "Distinctive websites and useful automations designed to save time and create measurable value.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PublicSiteChrome />
      </body>
    </html>
  );
}
