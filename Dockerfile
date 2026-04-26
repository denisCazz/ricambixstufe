# ── Stage 1: Install dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Build the application ──
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time: database per generateStaticParams (slug prodotti/categorie)
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG AUTH_SECRET
ENV AUTH_SECRET=$AUTH_SECRET

RUN npm run build

# ── Stage 3: Production runtime ──
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server
COPY --from=build /app/.next/standalone ./
# Copy static assets
COPY --from=build /app/.next/static ./.next/static
# Copy public assets
COPY --from=build /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=20s \
  CMD sh -c 'wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-3000} || exit 1'

CMD ["node", "server.js"]
