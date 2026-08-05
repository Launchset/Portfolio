#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
loadEnv(path.join(root, ".env.local"));
const command = process.argv[2] || "help";
const args = process.argv.slice(3);

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
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function apiKey() {
  const value = process.env.BING_WEBMASTER_API_KEY?.trim();
  if (!value) throw new Error("Set BING_WEBMASTER_API_KEY in .env.local.");
  return value;
}

function siteUrl() {
  return process.env.BING_WEBMASTER_SITE_URL?.trim() || "https://launchset.dev/";
}

async function bing(method, parameters = {}, options = {}) {
  const url = new URL(`https://ssl.bing.com/webmaster/api.svc/json/${method}`);
  url.searchParams.set("apikey", apiKey());
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.Message || data?.message || data?.d?.Message || response.statusText;
    throw new Error(`Bing Webmaster API ${response.status}: ${message}`);
  }
  return data.d;
}

function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (typeof value === "string") {
    const date = value.match(/^\/Date\((\d+)(?:[+-]\d{4})?\)\/$/);
    if (date) return new Date(Number(date[1])).toISOString().slice(0, 10);
  }
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== "__type" && key !== "AuthenticationCode" && key !== "DnsVerificationCode")
    .map(([key, item]) => [key, clean(item)]));
}

function display(value) {
  const safe = clean(value);
  if (Array.isArray(safe)) {
    if (safe.length) console.table(safe);
    else console.log("No rows returned.");
    return;
  }
  console.dir(safe, { depth: null, colors: true });
}

function recent(value, limit = 28) {
  return Array.isArray(value) ? value.slice(-limit) : value;
}

const commands = {
  help() {
    console.log(`Bing Webmaster Tools CLI

Discovery:
  npm run bing -- auth:check
  npm run bing -- sites

Read-only reports:
  npm run bing -- summary
  npm run bing -- queries
  npm run bing -- pages
  npm run bing -- crawl
  npm run bing -- issues
  npm run bing -- sitemaps
  npm run bing -- sitemap-submit [absolute sitemap URL]
  npm run bing -- url <absolute URL>
  npm run bing -- submission-quota`);
  },
  async "auth:check"() {
    const sites = await bing("GetUserSites");
    const launchset = (sites || []).find((site) => site.Url?.includes("launchset.dev"));
    if (!launchset) throw new Error("Authenticated, but launchset.dev is not available to this Bing user.");
    console.log(`Authenticated; Launchset site: ${launchset.Url}; verified: ${Boolean(launchset.IsVerified)}`);
  },
  async sites() {
    const sites = await bing("GetUserSites");
    display((sites || []).map((site) => ({ Url: site.Url, IsVerified: site.IsVerified })));
  },
  async summary() { display(recent(await bing("GetRankAndTrafficStats", { siteUrl: siteUrl() }))); },
  async queries() { display(await bing("GetQueryStats", { siteUrl: siteUrl() })); },
  async pages() { display(await bing("GetPageStats", { siteUrl: siteUrl() })); },
  async crawl() { display(recent(await bing("GetCrawlStats", { siteUrl: siteUrl() }))); },
  async issues() { display(await bing("GetCrawlIssues", { siteUrl: siteUrl() })); },
  async sitemaps() { display(await bing("GetFeeds", { siteUrl: siteUrl() })); },
  async "sitemap-submit"() {
    const feedUrl = args[0] || new URL("/sitemap.xml", siteUrl()).toString();
    await bing("SubmitFeed", {}, {
      method: "POST",
      body: { siteUrl: siteUrl(), feedUrl },
    });
    console.log(`Submitted sitemap to Bing: ${feedUrl}`);
  },
  async url() {
    if (!args[0]) throw new Error("Pass an absolute URL to inspect.");
    display(await bing("GetUrlInfo", { siteUrl: siteUrl(), url: args[0] }));
  },
  async "submission-quota"() { display(await bing("GetUrlSubmissionQuota", { siteUrl: siteUrl() })); },
};

try {
  const run = commands[command];
  if (!run) throw new Error(`Unknown command: ${command}. Run npm run bing -- help.`);
  await run();
} catch (error) {
  console.error(`\nError: ${error.message}`);
  process.exitCode = 1;
}
