const baseUrl = (process.argv[2] ?? "https://launchset.dev").replace(/\/$/, "");

const checks = [
  ["/", "text/html"],
  ["/work", "text/html"],
  ["/founder", "text/html"],
  ["/work/tools/caple-scrape-review", "text/html"],
  ["/work/tools/lead-audit-review", "text/html"],
  ["/privacy", "text/html"],
  ["/cookies", "text/html"],
  ["/terms", "text/html"],
  ["/robots.txt", "text/plain"],
  ["/sitemap.xml", "application/xml"],
  ["/llms.txt", "text/plain"],
  ["/llms-full.txt", "text/plain"],
  ["/agents.txt", "text/plain"],
  ["/manifest.webmanifest", "application/manifest+json"],
  ["/favicon.ico", ["image/x-icon", "image/vnd.microsoft.icon"]],
  ["/apple-icon.png", "image/png"],
  ["/icon-192.png", "image/png"],
  ["/icon-512.png", "image/png"],
];

let failed = false;
for (const [path, expectedType] of checks) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "Launchset production check" },
    });
    const contentType = response.headers.get("content-type") ?? "";
    const expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
    const valid = response.ok && expectedTypes.some((type) => contentType.includes(type));
    console.log(`${valid ? "PASS" : "FAIL"} ${response.status} ${path} ${contentType}`);
    if (!valid) failed = true;

    if (path === "/" && response.ok) {
      const html = await response.text();
      for (const marker of [
        '<link rel="canonical" href="https://launchset.dev"',
        'type="application/ld+json"',
        "launchsetfreelancer@gmail.com",
        "linkedin.com/in/johnhelyar1",
      ]) {
        if (!html.includes(marker)) {
          console.error(`FAIL homepage marker missing: ${marker}`);
          failed = true;
        }
      }
    }

    if (path === "/" && response.ok) {
      const link = response.headers.get("link") ?? "";
      const contentSignal = response.headers.get("content-signal") ?? "";
      if (!link.includes("/llms.txt") || !link.includes("/sitemap.xml")) {
        console.error("FAIL homepage discovery Link header missing llms.txt or sitemap.xml");
        failed = true;
      }
      if (!contentSignal.includes("search=yes") || !contentSignal.includes("ai-input=yes")) {
        console.error("FAIL homepage Content-Signal header missing search or AI input permission");
        failed = true;
      }
    }

    if (path === "/" && response.ok) {
      for (const header of [
        "strict-transport-security",
        "x-content-type-options",
        "referrer-policy",
        "permissions-policy",
        "content-security-policy-report-only",
      ]) {
        if (!response.headers.has(header)) {
          console.error(`FAIL homepage header missing: ${header}`);
          failed = true;
        }
      }
    }
  } catch (error) {
    console.error(`FAIL ${path}: ${error instanceof Error ? error.message : String(error)}`);
    failed = true;
  }
}

try {
  const response = await fetch(`${baseUrl}/`, {
    signal: AbortSignal.timeout(15_000),
    headers: {
      accept: "text/markdown",
      "user-agent": "Launchset production check",
    },
  });
  const contentType = response.headers.get("content-type") ?? "";
  const markdown = await response.text();
  const valid =
    response.ok &&
    contentType.includes("text/markdown") &&
    markdown.includes("# Launchset") &&
    response.headers.get("vary")?.toLowerCase().includes("accept");
  console.log(`${valid ? "PASS" : "FAIL"} ${response.status} / Accept: text/markdown ${contentType}`);
  if (!valid) failed = true;
} catch (error) {
  console.error(`FAIL / Accept: text/markdown: ${error instanceof Error ? error.message : String(error)}`);
  failed = true;
}

if (failed) process.exit(1);
console.log(`All ${checks.length} production checks passed for ${baseUrl}.`);
