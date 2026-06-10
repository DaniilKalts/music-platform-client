# syntax=docker/dockerfile:1

# ─── Этап 1: установка зависимостей ──────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── Этап 2: сборка приложения ───────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* переменные инлайнятся в бандл во время сборки.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FREE_PLAYLIST_LIMIT
ARG NEXT_PUBLIC_FREE_FAVORITES_LIMIT

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Этап 3: рантайм (минимальный образ) ─────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# output: "standalone" собирает self-contained сервер с минимальным
# набором файлов из node_modules — отдельный npm install не нужен.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
