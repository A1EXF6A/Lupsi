# Stage 1: Build the NestJS application
FROM node:22.13.1-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

# Copy root configuration and relevant package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies (including devDeps) to allow building the app
RUN pnpm install --frozen-lockfile

# Copy backend source code and perform the Nest build
COPY backend ./backend
RUN pnpm --filter backend build

# Stage 2: Create a production-ready package with flattened dependencies
FROM node:22.13.1-alpine AS deployer
WORKDIR /app
RUN npm install -g pnpm

# Re-copy configurations to run pnpm deploy
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Use 'pnpm deploy' to extract a production-ready version of the backend.
# This prevents MODULE_NOT_FOUND by flattening dependencies and avoiding broken symlinks.
# Starting from pnpm v10, the --legacy flag is needed for non-injected workspace packages.
RUN pnpm --filter backend --prod deploy --legacy /prod-backend

# Stage 3: The final lightweight production image
FROM node:22.13.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the producton node_modules and package manifest from the deployer stage
COPY --from=deployer /prod-backend ./

# Copy the compiled build artifacts (dist) from the builder stage
COPY --from=builder /app/backend/dist ./dist

# Expose NestJS default port (ensure this matches your .env or app config)
EXPOSE 3000

# Run the production app directly with node
CMD ["node", "dist/main"]
