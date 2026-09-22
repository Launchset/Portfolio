# Launchset

Launchset builds production websites, internal tools and workflow automation for small businesses.

**[View the live site](https://launchset.dev)**

This repository contains the public website and invite-only client platform. It demonstrates the same concerns that shape Launchset's client work: clear product presentation, controlled access, auditable workflows and deliberate releases.

## What this project demonstrates

- A responsive portfolio with structured project and tool case studies.
- An invite-only client portal with Google and magic-link authentication.
- Client, contract, billing and file workflows backed by Cloudflare D1 and R2.
- Consent-aware analytics, structured metadata and search/agent discovery routes.
- Isolated shadow and production environments with explicit release checks.

## Stack

Next.js, React, TypeScript, Better Auth, Stripe, Cloudflare Workers, D1 and R2.

## Repository guide

Start with [ARCHITECTURE.md](./ARCHITECTURE.md) for the system map and [AGENTS.md](./AGENTS.md) for change and validation conventions.

## Local development

```bash
npm install
npm run dev
```

The default local URL is `http://localhost:3000`. Google Analytics is automatically disabled on localhost and private network addresses.

## Production checks

```bash
npm run check
npm run build
```

## Environment

Copy `.env.example` to the environment configuration used by the host.

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-HX8DBNS3QQ
```

Analytics loads only after the visitor grants consent. Advertising storage and personalisation remain denied.

## Invite-only client authentication

Client access is allowlisted by email. Creating a client in the Launchset admin stores the invited email in the `clients` table; authenticated users only reach the client portal when their verified provider email matches an invited, contract-signed, or active client. Unknown and cancelled client emails are sent to `/access-required`.

The sign-in page supports Google and 15-minute magic links. Google needs its client ID and secret configured as Cloudflare Worker secrets:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

Register `https://launchset.dev/api/auth/callback/google` with Google. Use the full shadow hostname in place of `https://launchset.dev` when testing the shadow Worker. Magic-link delivery uses the `AUTH_EMAIL` binding and `AUTH_EMAIL_FROM` sender.

## Deployment

Production runs on the Cloudflare Worker defined by `wrangler.jsonc`. Shadow validation uses the isolated Worker, D1 databases and R2 bucket defined by `wrangler.shadow.jsonc`.

Build and deploy the shadow environment with:

```bash
npm run deploy:shadow
```

For production, review the exact change set and validate the isolated shadow Worker first. Run `npm run deploy` only after explicit production approval, then verify the affected live routes with `npm run verify:production`. Production secrets are stored as encrypted Worker secrets and must never be added to an env file committed to Git.

Search and agent discovery routes are generated at `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` and `/agents.txt`.
