# Frontend Dockerfile für Das Duell um die Geld

# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci

# Source Code kopieren
COPY . .

# Build
RUN npm run build

# Production Stage
FROM nginx:alpine AS production

# Nginx Config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build Output kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
