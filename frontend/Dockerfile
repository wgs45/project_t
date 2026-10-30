# Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV CI=true
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN npm install -g corepack@latest && corepack enable && corepack prepare pnpm@latest --activate

# Copy lockfile and package.json
COPY package.json pnpm-lock.yaml ./

# Run multi-step approval for native scripts
RUN pnpm i --frozen-lockfile --ignore-scripts && \
    pnpm approve-builds unrs-resolver && \
    pnpm i --frozen-lockfile

# Stage 2: Build the source code
FROM node:20-alpine AS builder
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

