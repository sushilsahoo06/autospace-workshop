# Multi-stage Production Dockerfile for NestJS GraphQL API
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install system dependencies needed for native modules & OpenSSL for Prisma
RUN apk add --no-cache libc6-compat openssl

# Copy root workspace and api package files
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy schema and source code
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/tsconfig*.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/
COPY apps/api/src ./apps/api/src

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build NestJS application
RUN yarn build

# Stage 2: Production Runner
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache openssl dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package and node_modules from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

USER nestjs

EXPOSE 3000

# Use dumb-init to properly handle PID 1 signals
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "apps/api/dist/src/main"]
