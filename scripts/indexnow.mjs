#!/usr/bin/env node

const productionOrigin = "https://launchset.dev";
const productionHost = new URL(productionOrigin).hostname;
const key = "d741c621a029fa2ac19b5648d7863617";
const command = process.argv[2] || "help";
const targetOrigin = (process.argv[3] || productionOrigin).replace(/\/$/, "");

async function getText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Launchset IndexNow check" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}.`);
  return response.text();
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

async function inspectSite(origin) {
  const keyUrl = `${origin}/${key}.txt`;
  const [keyBody, sitemap] = await Promise.all([
    getText(keyUrl),
    getText(`${origin}/sitemap.xml`),
  ]);

  if (keyBody.trim() !== key) {
    throw new Error(`IndexNow key verification failed at ${keyUrl}.`);
  }

  const urlList = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1].trim()));

  if (!urlList.length) throw new Error("The sitemap contains no URLs.");
  if (urlList.length > 10_000) throw new Error("IndexNow batches are limited to 10,000 URLs.");

  for (const url of urlList) {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== productionHost) {
      throw new Error(`Refusing non-production sitemap URL: ${url}`);
    }
  }

  return { keyUrl, urlList };
}

async function submit() {
  if (targetOrigin !== productionOrigin) {
    throw new Error(`Submission is production-only; expected ${productionOrigin}.`);
  }

  const { keyUrl, urlList } = await inspectSite(targetOrigin);
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: productionHost,
      key,
      keyLocation: keyUrl,
      urlList,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const detail = (await response.text()).trim();
    throw new Error(`IndexNow returned ${response.status}${detail ? `: ${detail}` : ""}.`);
  }

  console.log(`IndexNow accepted ${urlList.length} production URLs (${response.status}).`);
}

const commands = {
  help() {
    console.log(`Launchset IndexNow

  npm run indexnow -- check [site origin]
  npm run indexnow -- submit

The check command verifies the public key and production URLs in a site's sitemap.
Submission is restricted to https://launchset.dev.`);
  },
  async check() {
    const { keyUrl, urlList } = await inspectSite(targetOrigin);
    console.log(`Verified ${keyUrl}`);
    console.log(`Found ${urlList.length} production URLs:`);
    for (const url of urlList) console.log(`- ${url}`);
  },
  submit,
};

try {
  const run = commands[command];
  if (!run) throw new Error(`Unknown command: ${command}. Run npm run indexnow -- help.`);
  await run();
} catch (error) {
  console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
