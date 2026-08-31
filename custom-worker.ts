// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore The OpenNext worker is generated during the Cloudflare build.
import openNextWorker from "./.open-next/worker.js";

type WorkerEnvironment = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

type MarkdownPage = {
  title: string;
  description: string;
  start?: string;
  end?: string;
};

const markdownPages: Record<string, MarkdownPage> = {
  "/": {
    title: "Launchset — digital design and automation studio",
    description:
      "Launchset creates distinctive websites, practical internal tools and useful automations that save time and create measurable value.",
  },
  "/work": {
    title: "Our work — Launchset",
    description: "Website, automation, internal-tool and measurement work by Launchset.",
    start: "## Website work",
    end: "## Founder",
  },
  "/founder": {
    title: "Founder — Launchset",
    description: "John Helyar's background and the problem-solving perspective behind Launchset.",
    start: "## Founder",
    end: "## Contact",
  },
  "/work/tools/caple-scrape-review": {
    title: "Caple Scrape Review architecture — Launchset",
    description: "A staged supplier-data review and catalogue pipeline.",
    start: "### Caple Scrape Review",
    end: "### Lead Audit Review",
  },
  "/work/tools/lead-audit-review": {
    title: "Lead Audit Review architecture — Launchset",
    description: "A research, evidence, scoring and human-review system for business opportunities.",
    start: "### Lead Audit Review",
    end: "### Other systems",
  },
};

const discoveryLink =
  '</llms.txt>; rel="alternate"; type="text/markdown", </sitemap.xml>; rel="sitemap"; type="application/xml"';

function acceptsMarkdown(request: Request) {
  return request.headers.get("accept")?.toLowerCase().includes("text/markdown") ?? false;
}

function withDiscoveryHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("Content-Signal", "search=yes, ai-input=yes, ai-train=no");
  headers.set("Link", discoveryLink);
  headers.set("Vary", [headers.get("Vary"), "Accept"].filter(Boolean).join(", "));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withShadowHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function selectSection(markdown: string, page: MarkdownPage) {
  if (!page.start) return markdown.trim();

  const start = markdown.indexOf(page.start);
  if (start === -1) return markdown.trim();

  const end = page.end ? markdown.indexOf(page.end, start + page.start.length) : -1;
  return markdown.slice(start, end === -1 ? undefined : end).trim();
}

async function markdownResponse(request: Request, environment: WorkerEnvironment, page: MarkdownPage) {
  const assetUrl = new URL("/llms-full.txt", request.url);
  const asset = await environment.ASSETS.fetch(new Request(assetUrl));

  if (!asset.ok) return null;

  const pathname = new URL(request.url).pathname;
  const canonical = `https://launchset.dev${pathname === "/" ? "" : pathname}`;
  const content = selectSection(await asset.text(), page);
  const body = [
    "---",
    `title: ${JSON.stringify(page.title)}`,
    `description: ${JSON.stringify(page.description)}`,
    `canonical: ${JSON.stringify(canonical)}`,
    "---",
    "",
    content,
    "",
  ].join("\n");

  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Signal": "search=yes, ai-input=yes, ai-train=no",
      "Content-Type": "text/markdown; charset=utf-8",
      "Link": discoveryLink,
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Strict-Transport-Security": "max-age=31536000",
      "Vary": "Accept",
      "X-Content-Type-Options": "nosniff",
      "X-Markdown-Source": "/llms-full.txt",
    },
  });
}

const launchsetWorker = {
  async fetch(
    request: Request,
    environment: WorkerEnvironment,
    context: Parameters<typeof openNextWorker.fetch>[2],
  ) {
    const url = new URL(request.url);
    const isShadow = url.hostname.endsWith(".workers.dev");
    const page = markdownPages[url.pathname.replace(/\/$/, "") || "/"];

    if (isShadow && url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /\n", {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
    }

    if ((request.method === "GET" || request.method === "HEAD") && page && acceptsMarkdown(request)) {
      const response = await markdownResponse(request, environment, page);
      if (response) return isShadow ? withShadowHeaders(response) : response;
    }

    const response = await openNextWorker.fetch(request, environment, context);
    const isHtml = response.headers.get("content-type")?.includes("text/html") ?? false;
    const enrichedResponse = page && isHtml ? withDiscoveryHeaders(response) : response;

    return isShadow ? withShadowHeaders(enrichedResponse) : enrichedResponse;
  },
};

export default launchsetWorker;
