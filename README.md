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

## Deployment

The existing production site is hosted by Vercel from the `Launchset/Portfolio` GitHub repository, with `launchset.dev` proxied through Cloudflare. Branches should be deployed and reviewed through a Vercel preview before they replace `main`.

Search and agent discovery routes are generated at `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` and `/agents.txt`.
