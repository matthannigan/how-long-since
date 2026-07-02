# syntax=docker/dockerfile:1

# ---- Stage 1: build the static PWA ----
FROM node:22-alpine AS build
WORKDIR /app
# corepack activates the pnpm version pinned in package.json (packageManager field).
RUN corepack enable
# Install deps first for layer caching. The full dep tree is needed to build,
# including sharp (PWA icon generation) — the lockfile pins the linuxmusl prebuilt.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
# node_modules is excluded via .dockerignore, so this copies source only.
COPY . .
RUN pnpm build

# ---- Stage 2: runtime (zero-dependency static server) ----
FROM node:22-alpine
RUN apk add --no-cache tzdata
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
ENV NODE_ENV=production
# No install and no node_modules at runtime — the server uses only Node built-ins.
COPY --chown=app:app server ./server
COPY --from=build --chown=app:app /app/dist ./dist
EXPOSE 3000
USER app
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1
CMD ["node", "server/index.mjs"]
