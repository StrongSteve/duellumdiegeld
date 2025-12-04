# Frontend Dockerfile für Das Duell um die Geld

# Build Stage
FROM node:20-alpine AS builder

# Build arguments für Version-Info
ARG COMMIT_HASH=unknown
ARG BUILD_TIME

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci

# Source Code kopieren
COPY . .

# Build mit Version-Info als Environment-Variablen
ENV VITE_COMMIT_HASH=$COMMIT_HASH
ENV VITE_BUILD_TIME=$BUILD_TIME
RUN npm run build

# Production Stage
FROM nginx:alpine AS production

# Nginx Config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build Output kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
