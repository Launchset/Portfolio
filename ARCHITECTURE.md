# Launchset architecture

This document is the shortest route into the codebase. It explains where behaviour belongs, which files are authoritative, and how a request moves through the deployed system.

## System shape

Launchset is one Next.js App Router application deployed through OpenNext as a Cloudflare Worker.

```text
Browser
  -> custom-worker.ts
     -> markdown response for supported pages when Accept: text/markdown
     -> OpenNext worker for the normal Next.js application
        -> public website and portfolio
        -> Better Auth login and sessions
        -> client and admin portal
        -> D1, R2, Cloudflare Email and Stripe
```

`custom-worker.ts` is the public request boundary. It adds search and agent-discovery headers, serves selected pages as Markdown, protects the shadow hostname from indexing, and delegates normal application requests to OpenNext.

## Source map

| Area | Source of truth | Responsibility |
| --- | --- | --- |
| Public routes | `src/app/` | Route composition, metadata and route-specific styles |
| Homepage hero | `src/features/home/scroll-hero.tsx` | Homepage copy and scroll-led presentation |
| Homepage navigation | `src/features/home/home-navigation.tsx` | Intro, handoff and mobile navigation variants |
| Desktop hero artwork | `src/features/home/desktop-hero-visual.tsx` | Decorative desktop illustration only |
| Portfolio catalogue | `src/features/work/projects.ts` | Project metadata, descriptions, images and public URLs |
| Project pages | `src/app/work/` | Work index, website case studies and tool case studies |
| Authentication | `src/lib/auth.ts` | Better Auth configuration, Google login and magic-link delivery |
| Portal access | `src/features/portal/access.ts` | Session checks, client/admin access and Cloudflare app bindings |
| Contracts | `src/lib/contracts.ts` | Signature validation and PDF stamping |
| Stripe integration | `src/platform/stripe/` | Stripe requests, response parsing and webhook verification |
| Portal APIs | `src/app/api/` | HTTP validation and orchestration for clients, billing, contracts and webhooks |
| Platform entrypoint | `custom-worker.ts` | Cloudflare request handling before Next.js |
| Platform bindings | `wrangler.jsonc` | Production Worker, D1, R2, email, images and route configuration |
| Shadow bindings | `wrangler.shadow.jsonc` | Isolated validation environment |
| Database shape | `migrations/` | D1 schema history; never infer schema only from page queries |
| Public files | `public/` | Project images and agent/search discovery documents |

## Application domains

### Public site

The homepage, founder page, legal pages and public chrome are ordinary App Router pages. Public portfolio content should come from the portfolio data layer rather than being copied into several routes.

### Portfolio

`/work` is the project index. `/work/[slug]` renders website case studies, while `/work/tools/[slug]` renders internal-tool architecture pages. Route files should decide what page to show; project facts, illustrations and long case-study sections should live in named feature modules.

### Client portal

Better Auth owns identity and sessions in `AUTH_DB`. Launchset's application database, `APP_DB`, owns clients, contracts, payments and access status. A valid login is not sufficient by itself: the verified email must also belong to an allowed client, unless it matches the configured administrator email.

```text
Login
  -> Better Auth session in AUTH_DB
  -> verified email
     -> administrator email: admin routes
     -> invited / contract_signed / active client in APP_DB: client routes
     -> otherwise: /access-required
```

Contracts are stored in the `CONTRACTS` R2 bucket. Stripe is called from server routes; Stripe webhooks are signature-checked before they update application records.

## Dependency direction

The intended dependency direction is:

```text
app routes -> feature modules -> platform adapters and shared utilities
```

- Route files own Next.js concerns: metadata, params, redirects, status responses and page composition.
- Feature modules own domain copy, domain types, reusable sections and business rules.
- Platform modules own external services such as Cloudflare and Stripe.
- Shared modules contain small domain-neutral helpers and reusable presentation.
- Platform and shared modules must not import route files.
- Prefer direct imports from the defining file. Avoid broad barrel files that hide ownership.

The repository is being moved toward this shape incrementally:

```text
src/
  app/                 route boundaries
  features/
    home/              homepage composition and motion
    work/              project data and case-study sections
    portal/            clients, contracts and billing rules
  platform/
    cloudflare/        environment access
    stripe/            Stripe transport and verification
  shared/              domain-neutral components and utilities
```

## Change workflow

1. Read the route and its direct dependencies before editing.
2. Check `git status`; preserve unrelated work and stage only the intended files.
3. Keep refactors behaviour-preserving and separate from visual or copy changes.
4. Run `npm run lint`, TypeScript checking and the relevant build before release.
5. Validate against the isolated shadow Worker before any production promotion.
6. Deploy production only with explicit approval, then run `npm run verify:production` and inspect the affected live routes.

If the default Node heap is too small for linting or TypeScript, run the same tool with `node --max-old-space-size=4096`.
