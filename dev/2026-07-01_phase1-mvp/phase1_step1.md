# Phase 1 · Step 1 — Scaffolding & tooling

> Read [`phase1.md`](phase1.md) first for shared conventions, the global
> Definition of Done, and the decisions register.

## Objective

Stand up the empty project so it boots and every `pnpm` script runs green. After
this step there is a Vite + React 19 + TypeScript app with the full toolchain
(routing, Tailwind v4 + Soft Daylight tokens, shadcn, testing, PWA base) wired but
no features — a placeholder shell renders at `localhost` and the Claude Code
preview panel can launch it.

## Prerequisites

- None. This is the first step; the repo is docs-only.

## Context & references

- Stack + commands: [`tech.md`](../docs/architecture/tech.md) (all sections)
- Folder layout: [`structure.md`](../docs/architecture/structure.md) — Root Level,
  `src/` Organization, Configuration Files
- Tokens to install now: [`style-guide.md`](../docs/style-guide.md) §1 (colors,
  light + dark), §2 (fonts), §3 (radius scale)
- PWA config shape: [`design.md`](../docs/architecture/design.md) "PWA / Offline"
- Perf targets this enables: [`requirements.md`](../docs/requirements.md) Req 9.1–9.2, 9.7

## Scope / checklist

- [ ] `pnpm` project init; **pin toolchain**: `.nvmrc` (Node 22) + `"packageManager": "pnpm@…"` in `package.json`.
- [ ] Vite 6 + `@vitejs/plugin-react` + React 19 + TypeScript **strict**. `tsconfig.json` with `@/*` → `src/*` path alias.
- [ ] **TanStack Router** (file-based). Create the four route files as empty/placeholder shells: `routes/__root.tsx`, `routes/index.tsx`, `routes/time.tsx`, `routes/tasks.$taskId.tsx`, `routes/settings.tsx`. Router devtools in dev only.
- [ ] **Tailwind CSS v4** via `@tailwindcss/vite`. `src/styles/globals.css` with `@import "tailwindcss";` and an `@theme` block carrying the **Soft Daylight** tokens from style-guide §1 — light on `:root`, dark under `[data-theme="dark"]` / `.dark`. Include: surfaces, ink ramp + AA-safe tokens (`#6E675E`, `#B2452F`, `#8A5E15`), accent terracotta, status colors, the 10 category base hues, radius scale (chips 9 / inputs 14 / cards 16 / screen 26 / button 26).
- [ ] **Fonts**: Bricolage Grotesque + DM Sans. Self-host (preferred for offline/PWA) or Google Fonts import per style-guide §2. Wire the system fallback stack.
- [ ] **shadcn/ui** init: `components.json` (Vite mode, `@/components/ui`, Tailwind v4). Don't add components yet — that happens in step 4+.
- [ ] **ESLint + Prettier**: `eslint.config.mjs`, `.prettierrc`. Enforce import order and named-export preference.
- [ ] **Vitest** (`jsdom` env) + React Testing Library + `vitest-axe` + `fake-indexeddb`. `src/test/setup.ts` wires `fake-indexeddb/auto`, RTL `cleanup`, and `vitest-axe` matchers globally. Verify the `@/` alias resolves in **both** Vite and Vitest config.
- [ ] **Playwright** config + one smoke spec in `e2e/` (loads the shell, asserts the title).
- [ ] **`vite-plugin-pwa`** installed with a minimal config (`registerType: 'autoUpdate'`, name/short_name/theme_color). **Dev dry-run only** — full manifest, icons, and offline verification are step 9. Don't generate/commit placeholder icons yet.
- [ ] **`.claude/launch.json`** with a `dev` configuration (`pnpm run dev`, correct port) so the preview panel can boot the app.
- [ ] Placeholder `AppShell` / `__root` rendering the app title "How Long Since" so there's something to see and to smoke-test.
- [ ] `package.json` scripts: `dev`, `build`, `preview`, `test`, `test:watch`, `typecheck`, `lint`, `format`, `e2e` (matching tech.md).
- [ ] `.gitignore` covers `node_modules/`, `dist/`, `playwright-report/`, `coverage/`, `.DS_Store` (extend the existing file).

## Try it (manual)

1. `pnpm install && pnpm dev` → open the printed `localhost` URL; the shell renders "How Long Since" with the warm-white (`#FAF8F4`) page background and the correct fonts.
2. Toggle OS dark mode (or set `[data-theme="dark"]`) → surfaces become charcoal-brown; text warm off-white.
3. `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e` → all green.
4. Start the preview panel from `.claude/launch.json` → it boots and shows the shell.

## Explicitly out of scope

- Any real UI, data, or business logic (steps 2–8).
- shadcn component generation (step 4 onward, on demand).
- Full PWA manifest + icons + offline caching verification (step 9).
- Theme **provider** logic / persistence — this step only ships the CSS tokens and
  fallback; wiring theme to `AppSettings` is step 4.

## Acceptance criteria

- Every `pnpm` script listed above exits 0.
- `@/` imports resolve under both `pnpm dev`/`build` and `pnpm test`.
- Soft Daylight tokens are present as `@theme` variables (light + dark) and used by
  the placeholder shell (no hard-coded hex).
- Meets the shared Definition of Done in [`phase1.md`](phase1.md).

## Risks / decisions

- **Tailwind v4 is CSS-first** — there is no `tailwind.config.js`; tokens live in
  `globals.css`'s `@theme`. Don't scaffold a JS config.
- **React 19 + peer deps:** confirm `dexie-react-hooks`, RHF, and shadcn deps
  resolve against React 19 before locking versions.
- **Fonts for offline:** self-hosting avoids a network dependency in the installed
  PWA; if using the Google Fonts CDN, note it will need caching in step 9.
