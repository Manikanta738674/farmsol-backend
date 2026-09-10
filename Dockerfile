FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY shared ./shared

# Install dependencies and build shared + backend
RUN npm ci --omit=optional
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY shared ./shared
RUN npm ci --omit=dev --omit=optional

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
