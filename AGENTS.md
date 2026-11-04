<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# studio-space

Next.js 16 App Router app in `src/`. Early stage: single page (`src/app/page.tsx`), no tests, no CI.

## Commands

- `npm run dev` — dev server (Turbopack, port 3000)
- `npm run build` — production build (also Turbopack)
- `npm run lint` — ESLint 9 flat config
- Typecheck: no script; run `npx tsc --noEmit` before finishing changes
- No test framework is installed — don't assume one

## Toolchain quirks (all verified in `next.config.ts` / `package.json`)

- **React Compiler is enabled** (`reactCompiler: true`). Do not add manual `useMemo`/`useCallback`/`React.memo`; follow the Rules of React strictly (no conditional/early-return hooks) — violations fail the build.
- **Tailwind v4, CSS-first**: there is no `tailwind.config.*`. Theme tokens live in `src/app/globals.css` (`@theme` etc.).
- Turbopack loads Tailwind via `@tailwindcss/turbopack` (configured in `next.config.ts`); PostCSS is not used here.

## shadcn/ui — Base UI, not Radix

- `components.json` uses style `"base-nova"`; primitives under `src/components/ui/` are built on `@base-ui/react`, so their prop APIs differ from the Radix-based shadcn examples.
- Add components with the shadcn CLI (`npx shadcn add <name>`) rather than hand-writing them; imports use `@/` → `./src/*` (see `tsconfig.json`).

## Auth

- better-auth with email/password, MongoDB Atlas via `@better-auth/mongo-adapter` (db name `StudioSpace`).
- Server config: `src/lib/auth.ts`; client: `src/lib/auth-client.ts`; catch-all handlers: `src/app/api/auth/[...all]/route.ts`.
- Requires env vars `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI` (in `.env`).
