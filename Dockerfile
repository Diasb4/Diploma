# Stage 1: Build Frontend and Backend
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build React client and Express server
RUN npm run client:build
RUN npm run server:build

# Stage 2: Production runtime
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/dist-server ./dist-server
COPY --chown=node:node --from=builder /app/data ./data

USER node

EXPOSE 5000

CMD ["node", "dist-server/index.js"]
