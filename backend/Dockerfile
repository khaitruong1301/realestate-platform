# ---------- deps: cài toàn bộ dependency để build ----------
FROM node:20-slim AS deps
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---------- build: compile TypeScript + generate Prisma client ----------
FROM deps AS build
COPY . .
RUN npx prisma generate && npm run build && npm prune --omit=dev && npx prisma generate

# ---------- runtime: image gọn, chạy bằng user không phải root ----------
FROM node:20-slim AS runtime
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl curl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --chown=node:node package.json docker-entrypoint.sh ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD curl -fsS http://localhost:4000/api/health || exit 1
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
