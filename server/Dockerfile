# ==========================================
# 1. Base image (Node.js 24 Alpine)
# ==========================================
FROM node:24-alpine AS base
WORKDIR /usr/src/app

# ==========================================
# 2. Dependencies stage
# ==========================================
FROM base AS dependencies
COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install --frozen-lockfile --ignore-engines

# ==========================================
# 3. Build stage
# ==========================================
FROM dependencies AS build
COPY . .
RUN yarn prisma generate
RUN yarn build

# ==========================================
# 4. Production stage (Non-root user node)
# ==========================================
FROM base AS production
ENV NODE_ENV=production

COPY package.json yarn.lock ./
COPY --from=build --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --from=build --chown=node:node /usr/src/app/prisma ./prisma
COPY --from=build --chown=node:node /usr/src/app/prisma.config.ts ./prisma.config.ts

USER node

EXPOSE 3000

# Exécute automatiquement les migrations Prisma sur la base PostgreSQL au démarrage puis démarre l'API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
