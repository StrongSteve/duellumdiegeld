# Unified Dockerfile for Das Duell um die Geld
# Single container with PostgreSQL, NestJS Backend, and Nginx Frontend
# See docs/adr/0009-single-container-deployment.md for rationale

# =============================================================================
# Stage 1: Build Frontend
# =============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# =============================================================================
# Stage 2: Build Backend
# =============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY backend/ ./
RUN npm run build

# =============================================================================
# Stage 3: Production Image
# =============================================================================
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    nginx \
    nodejs \
    npm \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 (Ubuntu 22.04 has older version)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# =============================================================================
# Setup PostgreSQL
# =============================================================================
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER dasduell WITH SUPERUSER PASSWORD 'dasduell';" && \
    createdb -O dasduell dasduell && \
    /etc/init.d/postgresql stop

USER root

# Configure PostgreSQL to allow local connections
RUN echo "host all all 127.0.0.1/32 md5" >> /etc/postgresql/14/main/pg_hba.conf && \
    echo "listen_addresses='127.0.0.1'" >> /etc/postgresql/14/main/postgresql.conf

# =============================================================================
# Setup Backend
# =============================================================================
WORKDIR /app/backend

# Copy backend build and dependencies
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/prisma ./prisma

# Generate Prisma client for the production platform
RUN npx prisma generate

# =============================================================================
# Setup Frontend (Nginx)
# =============================================================================
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Nginx configuration
RUN rm /etc/nginx/sites-enabled/default
COPY deploy/nginx.conf /etc/nginx/sites-enabled/default

# =============================================================================
# Setup Supervisor
# =============================================================================
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# =============================================================================
# Startup Script
# =============================================================================
COPY deploy/start.sh /start.sh
RUN chmod +x /start.sh

# Environment variables
ENV DATABASE_URL="postgresql://dasduell:dasduell@127.0.0.1:5432/dasduell?schema=public"
ENV NODE_ENV=production
ENV PORT=3000

# Render uses port 10000 by default
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:10000/api/questions/count || exit 1

CMD ["/start.sh"]
