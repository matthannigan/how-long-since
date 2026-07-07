# Phase 1 · Step 10 — Containerized production deployment

> Read [`phase1.md`](phase1.md) first for shared conventions and the DoD.

## Objective

Package the built PWA as a Docker image and compose file that serve the static
`dist/`, mirroring the conventions of the user's `galley` project
(`/Users/matth/dev/galley`). After this step `docker compose up` serves the app
on a mapped port, deep-links resolve (SPA fallback), `/health` returns 200, and it
runs non-root — ready to sit behind a Cloudflare Tunnel.

## Prerequisites

- Step 9 complete (production build is optimized, PWA works offline, E2E green).

## Context & references

- Mirror these files from galley for **conventions** (not content):
  `/Users/matth/dev/galley/Dockerfile`, `docker-compose.yml`, `.dockerignore`,
  and its README "Docker" / "Security" sections.
- Key galley conventions to reuse: `node:22-alpine`, multi-stage build, a
  dedicated **non-root** user, `docker-compose.yml` with `PORT`/`TZ`/`restart:
  unless-stopped`, a **`/health`** endpoint + `HEALTHCHECK`, `.dockerignore`,
  **no built-in auth** (access control at the network layer — Cloudflare Tunnel).

## Key difference from galley

Galley is a **stateful Node/Express server** with a mounted `/data` volume,
PUID/PGID handling, and a `docker-entrypoint.sh` that seeds files and drops
privileges. **How Long Since is a stateless static SPA** — all user data lives in
the browser's IndexedDB, there is no server-side state. So this deployment:

- **drops** the `/data` volume, PUID/PGID logic, and the entrypoint entirely;
- **serves the built `dist/`** as static files with a **SPA fallback** (client-side
  routing via TanStack Router) and **PWA-aware cache headers**;
- keeps galley's shape everywhere else (alpine, non-root, `/health`, compose, Tunnel).

## Scope / checklist

### Static server — `server/index.js` (~25 lines) or nginx
- [ ] Minimal **Express** static server (mirrors galley's Node/Express choice):
  - [ ] Serve `dist/` static assets.
  - [ ] **Cache headers**: hashed assets (`/assets/*`) `Cache-Control: public, max-age=31536000, immutable`; **`index.html`, `sw.js`, `manifest.webmanifest`** → `no-cache` (so PWA updates land — never pin the service worker).
  - [ ] **SPA fallback**: unknown non-file routes → send `dist/index.html` (so `/` (Quick Wins), `/category`, `/time`, `/settings`, `/tasks/:id` deep-link correctly). Do **not** fallback for real asset 404s.
  - [ ] **`GET /health`** → 200 (for the compose healthcheck).
  - [ ] Listen on `PORT` (default 3000).
  - [ ] *(Alternative noted: `nginx:alpine` with `try_files $uri /index.html;` + a `/health` location + the same cache rules — leaner, but diverges from galley's Node base.)*

### `Dockerfile` (multi-stage, mirrors galley)
- [ ] **Stage 1 `build`**: `node:22-alpine`, enable corepack/**pnpm**, `pnpm install --frozen-lockfile`, `pnpm build` → `dist/`.
- [ ] **Stage 2 runtime**: `node:22-alpine`; `apk add --no-cache tzdata`; create a dedicated non-root user (e.g. `addgroup -S app && adduser -S app -G app`); copy `dist/` + the server + its prod deps `--chown=app:app`; `ENV NODE_ENV=production`; `EXPOSE 3000`; `USER app`; `HEALTHCHECK CMD wget -q --spider http://localhost:3000/health || exit 1`; `CMD ["node","server/index.js"]`. **No entrypoint script, no volume.**

### `docker-compose.yml` (mirrors galley, minus the volume)
- [ ] One service `how-long-since`: `build: .`; `ports: "${PORT:-3000}:3000"`; `environment: TZ=${TZ:-UTC}`; `healthcheck` hitting `/health`; `restart: unless-stopped`. **No `volumes:`** (stateless).

### Supporting files
- [ ] **`.dockerignore`** (from galley's shape): `node_modules/`, `.git/`, `.claude/`, `dev/`, `docs/`, `e2e/`, `coverage/`, `playwright-report/`, `*.md` (keep what the build needs).
- [ ] **README** "Docker" + "Deployment" sections: `docker build` / `docker run -p 3000:3000` and `docker compose up`; env-var table (`PORT`, `TZ`); a **Security** note mirroring galley — no built-in auth, put it behind a Cloudflare Tunnel / reverse proxy with auth before exposing it.

## Try it (manual)

1. `docker compose up --build` → container starts and passes its healthcheck.
2. Open `http://localhost:3000` → the app loads (production PWA).
3. Navigate to `/time` and `/settings`, then **hard-reload** each → they resolve (SPA fallback works — no 404).
4. `curl -s -o /dev/null -w "%{http_code}" localhost:3000/health` → `200`.
5. Add tasks, go offline (devtools), reload → data persists (IndexedDB is client-side; the container holds no state — data survives because it was always in the browser).
6. `docker inspect` / `docker exec` → process runs as the non-root `app` user; check response cache headers on an `/assets/*` file vs `index.html`.

## Explicitly out of scope

- Authentication / authorization (deliberately none — network-layer only, per galley).
- Any server-side persistence, database, or `/data` volume (app is stateless).
- CI/CD pipeline, registry publishing, TLS termination, the Cloudflare Tunnel
  itself (host/ops concern, documented but not built here).

## Acceptance criteria

- `docker compose up` serves the built PWA; `/health` returns 200; `HEALTHCHECK` healthy.
- Deep-linking to client routes works via SPA fallback; asset 404s are real 404s.
- Cache headers: immutable for hashed assets, `no-cache` for `index.html`/`sw.js`.
- Container runs **non-root**; no volume; image built from an optimized multi-stage build.
- README documents build/run/compose, env vars, and the no-auth/Cloudflare-Tunnel
  security posture.
- Meets the shared Definition of Done in [`phase1.md`](phase1.md) (that which applies
  to a deployment artifact — build succeeds, no dead files, docs accurate).

## Risks / decisions

- **Never long-cache `sw.js` / `index.html`** — doing so strands users on a stale
  PWA. Immutable caching is only for content-hashed `/assets/*`.
- **SPA fallback must not mask asset 404s** — fallback only for navigation
  requests, or the browser silently gets HTML for a missing JS chunk.
- **Express vs nginx** — Express chosen to mirror galley; nginx is the noted leaner
  alternative if the Node runtime is unwanted for a purely static payload.
- **Statelessness is a feature** — because data is client-side, the container is
  trivially horizontally scalable and needs no backup/volume story (that's the
  user's JSON/CSV export from step 8).
