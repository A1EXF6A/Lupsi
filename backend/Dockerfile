FROM node:22.13.1-alpine AS deps
WORKDIR /app
ENV CI=true
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --filter backend... --frozen-lockfile

# Stage 2: Builder
FROM node:22.13.1-alpine AS builder
WORKDIR /app
ENV CI=true
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .
RUN pnpm --filter backend build
RUN pnpm install --filter backend... --prod

# Stage 3: Runner
FROM node:22.13.1-alpine AS runner
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
