# Backend Dockerfile für Das Duell um die Geld

# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Package files kopieren
COPY package*.json ./
COPY prisma ./prisma/

# Dependencies installieren
RUN npm ci

# Prisma Client generieren
RUN npx prisma generate

# Source Code kopieren
COPY . .

# Build
RUN npm run build

# Production Stage
FROM node:20-alpine AS production

WORKDIR /app

# OpenSSL installieren für Prisma
RUN apk add --no-cache openssl

# Nur Production Dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

# Prisma Client generieren
RUN npx prisma generate

# Build Output kopieren
COPY --from=builder /app/dist ./dist

# Nicht als Root ausführen
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main"]
