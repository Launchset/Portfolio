export const siteUrl = "https://launchset.dev";
export const studioId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;
export const founderId = `${siteUrl}/founder#person`;

export const studioReference = { "@id": studioId };
export const websiteReference = { "@id": websiteId };
export const founderReference = { "@id": founderId };

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function breadcrumbList(
  id: string,
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    "@id": absoluteUrl(id),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
