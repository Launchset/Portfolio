# Launchset

The production website for [launchset.dev](https://launchset.dev), built with Next.js and the App Router.

## Local development

```bash
npm install
npm run dev
```

The default local URL is `http://localhost:3000`. Google Analytics is automatically disabled on localhost and private network addresses.

## Production checks

```bash
npm run lint
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

For production, build first and upload a dormant Worker version for review. Promote that exact version with `wrangler versions deploy` only after explicit approval. Production secrets are stored as encrypted Worker secrets and must never be added to an env file committed to Git.

Search and agent discovery routes are generated at `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` and `/agents.txt`.
