import type { MetadataRoute } from "next";

const baseUrl = "https://launchset.dev";
const lastModified = new Date("2026-07-22");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/work`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/founder`, lastModified, changeFrequency: "yearly", priority: 0.7 },
    { url: `${baseUrl}/work/tools/caple-scrape-review`, lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/work/tools/lead-audit-review`, lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
