# Multi-stage production Dockerfile for LumenRadar AI
FROM node:22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache python3 make g++ sqlite

# Install all dependencies (including build tools)
COPY package*.json ./
RUN npm install

# Build static frontend into dist/
COPY . .
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app
RUN apk add --no-cache python3 make g++ sqlite

COPY package*.json ./
RUN npm install --omit=dev

COPY tsconfig*.json ./
COPY backend/ ./backend/
COPY scripts/ ./scripts/
COPY tests/ ./tests/
COPY --from=builder /app/dist ./dist

# Persistent volume for SQLite database & logs
VOLUME ["/app/data"]

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV API_PORT=3000

# Express serves both API (/api/*) and production SPA UI (/*)
CMD ["npx", "tsx", "backend/server.ts"]
