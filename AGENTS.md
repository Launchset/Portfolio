# Repository working guide

Read `ARCHITECTURE.md` before making a cross-cutting change.

## Priorities

- Preserve user work. The tree may contain concurrent or untracked design files; do not delete, restore or stage them unless the task names them.
- Make the narrowest change that satisfies the request.
- Separate refactors from copy, visual and behaviour changes so each diff remains reviewable.
- Verify the actual route, config and generated output before reporting success.
- Never expose Worker secrets, authentication tokens, client data or contract contents.

## Where code belongs

- `src/app/`: route boundaries, metadata, route-level loading and composition.
- `src/features/`: domain content, types, business rules and substantial page sections.
- `src/platform/`: Cloudflare, Stripe and other external-service adapters.
- `src/shared/`: small domain-neutral components, formatting and security helpers.
- `custom-worker.ts`: only behaviour that must happen before the Next.js worker.
- `migrations/`: authoritative database schema changes.

Keep route handlers thin: validate the request, enforce access, call a named domain/platform function and create the response. Do not add more unrelated SQL, formatting or vendor protocol code directly to a route.

Prefer explicit names and direct imports. A future reader should be able to find a fact or business rule with one `rg` search. Do not create generic `utils.ts`, `helpers.ts`, large barrel exports or abstractions used in only one trivial place.

## Validation

Run the checks relevant to the change:

```bash
npm run check
npm run build
git diff --check
```

If the default Node heap is too small, rerun the individual lint or TypeScript command with `node --max-old-space-size=4096`.

For Cloudflare runtime changes, also build and validate the shadow environment. Production deployment always requires explicit user approval. Shadow must remain isolated and noindex.

## Git discipline

- Inspect `git status --short` before and after work.
- Stage explicit paths; never sweep unrelated files into a commit.
- Do not rewrite or discard changes that came from another agent or the user.
- A production release must contain only the reviewed change set.
