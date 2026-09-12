# syntax=docker/dockerfile:1
# STIX MΛGIC — self-host build (Dokploy/Docker). The platform deploy still
# defaults to the Vercel nitro preset; here we build a standalone node server.

FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# NOTE: repo lockfile drifts from package.json, so `npm ci` (strict) fails;
# use a tolerant install until the lockfile is regenerated.
RUN npm install --no-audit --no-fund

COPY . .
ENV NITRO_PRESET=node-server
ENV VITE_AUTH_ENABLED=false
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
