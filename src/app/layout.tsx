import type { Metadata } from "next";
import Analytics from "@/src/components/layout/analytics";
import CookieBanner from "@/src/components/layout/cookie-banner";
import Footer from "@/src/components/layout/footer";
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://launchset.dev/#studio",
  name: "Launchset",
  url: "https://launchset.dev",
  logo: "https://launchset.dev/icon.png",
  image: "https://launchset.dev/opengraph-image",
  description:
    "A digital design and automation studio creating distinctive websites, practical internal tools and useful automations.",
  email: "launchsetfreelancer@gmail.com",
  founder: {
    "@type": "Person",
    name: "John Helyar",
    url: "https://launchset.dev/founder",
    sameAs: ["https://www.linkedin.com/in/johnhelyar1/"],
  },
  sameAs: ["https://www.linkedin.com/in/johnhelyar1/"],
  knowsAbout: [
    "Web design",
    "Web development",
    "Business automation",
    "Internal tools",
    "Data review systems",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <Footer />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
