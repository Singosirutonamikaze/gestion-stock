# ==========================================
# 1. Base image
# ==========================================
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# ==========================================
# 2. Dependencies stage
# ==========================================
FROM base AS dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# ==========================================
# 3. Build stage
# ==========================================
FROM dependencies AS build
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# ==========================================
# 4. Production stage (Non-root user node)
# ==========================================
FROM base AS production
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=build --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --from=build --chown=node:node /usr/src/app/prisma ./prisma

USER node

EXPOSE 3000

CMD ["node", "dist/main"]
