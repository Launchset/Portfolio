"use client";

import { usePathname } from "next/navigation";
import Analytics from "./analytics";
import CookieBanner from "./cookie-banner";
import Footer from "./footer";

const privatePrefixes = ["/access-required", "/account", "/admin", "/contracts"];

export default function PublicSiteChrome() {
  const pathname = usePathname();
  if (privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return null;

  return <><Footer /><CookieBanner /><Analytics /></>;
}
