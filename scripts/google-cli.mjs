#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
loadEnv(path.join(root, ".env.local"));
const command = process.argv[2] || "help";
const args = process.argv.slice(3);
const canSubmitSitemap = command === "sc:sitemap-submit";
const canEditAnalytics = command === "ga:key-event-create";
const scopes = [
  canEditAnalytics
    ? "https://www.googleapis.com/auth/analytics.edit"
    : "https://www.googleapis.com/auth/analytics.readonly",
  canSubmitSitemap
    ? "https://www.googleapis.com/auth/webmasters"
    : "https://www.googleapis.com/auth/webmasters.readonly",
];

function loadEnv(filename) {
  if (!fs.existsSync(filename)) return;
  for (const rawLine of fs.readFileSync(filename, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1).replace(/\\n/g, "\n");
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function credentials() {
  const filename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!filename) throw new Error("Set GOOGLE_APPLICATION_CREDENTIALS in .env.local.");
  const resolved = path.isAbsolute(filename) ? filename : path.join(root, filename);
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

async function accessToken() {
  const account = credentials();
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(value).toString("base64url");
  const header = encode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = encode(JSON.stringify({
    iss: account.client_email,
    scope: scopes.join(" "),
    aud: account.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), account.private_key).toString("base64url");
  const response = await fetch(account.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Google authentication failed: ${data.error_description || data.error || response.status}`);
  return data.access_token;
}

async function google(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      authorization: `Bearer ${await accessToken()}`,
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Google API ${response.status}: ${data?.error?.message || response.statusText}`);
  return data;
}

function gaProperty() {
  const value = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  if (!value) throw new Error("Set GOOGLE_ANALYTICS_PROPERTY_ID in .env.local. Run ga:properties to discover it.");
  return String(value).replace(/^properties\//, "");
}

function scSite() {
  const value = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
  if (!value) throw new Error("Set GOOGLE_SEARCH_CONSOLE_SITE_URL in .env.local. Run sc:sites to discover it.");
  return value;
}

function reportDays(value, fallback = 28) {
  const parsed = Number.parseInt(value || String(fallback), 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 500) throw new Error("Days must be between 1 and 500.");
  return parsed;
}

function table(rows) {
  if (!rows.length) console.log("No rows returned.");
  else console.table(rows);
}

async function gaReport({ dimensions, metrics, numberOfDays, limit = 25, orderBys }) {
  const data = await google(`https://analyticsdata.googleapis.com/v1beta/properties/${gaProperty()}:runReport`, {
    method: "POST",
    body: JSON.stringify({
      dateRanges: [{ startDate: `${numberOfDays}daysAgo`, endDate: "yesterday" }],
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
      limit: String(limit),
      ...(orderBys ? { orderBys } : {}),
    }),
  });
  return (data.rows || []).map((row) => Object.fromEntries([
    ...dimensions.map((name, index) => [name, row.dimensionValues?.[index]?.value || ""]),
    ...metrics.map((name, index) => [name, row.metricValues?.[index]?.value || "0"]),
  ]));
}

async function scReport(dimensions, numberOfDays) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - numberOfDays + 1);
  const iso = (date) => date.toISOString().slice(0, 10);
  const data = await google(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(scSite())}/searchAnalytics/query`,
    {
      method: "POST",
      body: JSON.stringify({ startDate: iso(start), endDate: iso(end), dimensions, rowLimit: 25 }),
    },
  );
  return (data.rows || []).map((row) => ({
    ...Object.fromEntries(dimensions.map((name, index) => [name, row.keys?.[index] || ""])),
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: `${((row.ctr || 0) * 100).toFixed(2)}%`,
    position: Number(row.position || 0).toFixed(1),
  }));
}

const commands = {
  help() {
    console.log(`Read-only Google Analytics + Search Console CLI

Discovery:
  npm run google -- auth:check
  npm run google -- ga:properties
  npm run google -- sc:sites

Reports:
  npm run google -- ga:overview [days]
  npm run google -- ga:summary [days]
  npm run google -- ga:pages [days]
  npm run google -- ga:sources [days]
  npm run google -- ga:events [days]
  npm run google -- ga:key-events
  npm run google -- ga:key-event-create <event name>
  npm run google -- sc:queries [days]
  npm run google -- sc:summary [days]
  npm run google -- sc:pages [days]
  npm run google -- sc:countries [days]
  npm run google -- sc:devices [days]
  npm run google -- sc:sitemaps
  npm run google -- sc:sitemap-submit [absolute sitemap URL]
  npm run google -- sc:inspect <absolute URL>`);
  },
  async "auth:check"() {
    const account = credentials();
    await accessToken();
    console.log(`Authenticated as ${account.client_email}`);
  },
  async "ga:properties"() {
    const data = await google("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200");
    table((data.accountSummaries || []).flatMap((account) =>
      (account.propertySummaries || []).map((property) => ({
        account: account.displayName,
        property: property.displayName,
        propertyId: property.property?.replace("properties/", ""),
      })),
    ));
  },
  async "ga:overview"() {
    table(await gaReport({ dimensions: ["date"], metrics: ["activeUsers", "newUsers", "sessions", "engagedSessions", "eventCount"], numberOfDays: reportDays(args[0]), limit: 100, orderBys: [{ dimension: { dimensionName: "date" } }] }));
  },
  async "ga:summary"() {
    table(await gaReport({ dimensions: [], metrics: ["activeUsers", "newUsers", "sessions", "engagedSessions", "screenPageViews", "eventCount"], numberOfDays: reportDays(args[0]), limit: 1 }));
  },
  async "ga:pages"() {
    table(await gaReport({ dimensions: ["pagePath"], metrics: ["screenPageViews", "activeUsers", "engagedSessions"], numberOfDays: reportDays(args[0]), orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }] }));
  },
  async "ga:sources"() {
    table(await gaReport({ dimensions: ["sessionSourceMedium"], metrics: ["sessions", "activeUsers", "engagedSessions"], numberOfDays: reportDays(args[0]), orderBys: [{ metric: { metricName: "sessions" }, desc: true }] }));
  },
  async "ga:events"() {
    table(await gaReport({ dimensions: ["eventName"], metrics: ["eventCount", "totalUsers"], numberOfDays: reportDays(args[0]), orderBys: [{ metric: { metricName: "eventCount" }, desc: true }] }));
  },
  async "ga:key-events"() {
    const data = await google(`https://analyticsadmin.googleapis.com/v1beta/properties/${gaProperty()}/keyEvents?pageSize=100`);
    table((data.keyEvents || []).map((item) => ({ eventName: item.eventName, countingMethod: item.countingMethod, created: item.createTime })));
  },
  async "ga:key-event-create"() {
    const eventName = args[0];
    if (!eventName) throw new Error("Pass the event name to create as a key event.");
    const current = await google(`https://analyticsadmin.googleapis.com/v1beta/properties/${gaProperty()}/keyEvents?pageSize=100`);
    const existing = (current.keyEvents || []).find((item) => item.eventName === eventName);
    if (existing) {
      console.log(`${eventName} is already a key event (${existing.countingMethod}).`);
      return;
    }
    const created = await google(`https://analyticsadmin.googleapis.com/v1beta/properties/${gaProperty()}/keyEvents`, {
      method: "POST",
      body: JSON.stringify({ eventName, countingMethod: "ONCE_PER_SESSION" }),
    });
    console.log(`Created ${created.eventName} as a key event (${created.countingMethod}).`);
  },
  async "sc:sites"() {
    const data = await google("https://searchconsole.googleapis.com/webmasters/v3/sites");
    table((data.siteEntry || []).map((site) => ({ siteUrl: site.siteUrl, permission: site.permissionLevel })));
  },
  async "sc:queries"() { table(await scReport(["query"], reportDays(args[0]))); },
  async "sc:summary"() { table(await scReport([], reportDays(args[0]))); },
  async "sc:pages"() { table(await scReport(["page"], reportDays(args[0]))); },
  async "sc:countries"() { table(await scReport(["country"], reportDays(args[0]))); },
  async "sc:devices"() { table(await scReport(["device"], reportDays(args[0]))); },
  async "sc:sitemaps"() {
    const data = await google(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(scSite())}/sitemaps`);
    table((data.sitemap || []).map((item) => ({ path: item.path, submitted: item.lastSubmitted, downloaded: item.lastDownloaded, warnings: item.warnings, errors: item.errors, pending: item.isPending })));
  },
  async "sc:sitemap-submit"() {
    const sitemapUrl = args[0] || "https://launchset.dev/sitemap.xml";
    await google(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(scSite())}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
      { method: "PUT" },
    );
    console.log(`Submitted ${sitemapUrl}`);
  },
  async "sc:inspect"() {
    if (!args[0]) throw new Error("Pass the absolute URL to inspect.");
    const data = await google("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
      method: "POST",
      body: JSON.stringify({ inspectionUrl: args[0], siteUrl: scSite(), languageCode: "en-GB" }),
    });
    console.dir(data.inspectionResult, { depth: null, colors: true });
  },
};

try {
  const run = commands[command];
  if (!run) throw new Error(`Unknown command: ${command}. Run npm run google -- help.`);
  await run();
} catch (error) {
  console.error(`\nError: ${error.message}`);
  process.exitCode = 1;
}
