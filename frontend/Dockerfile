# Stage 1: Build
FROM node:22.13.1-alpine AS builder
WORKDIR /app

# Instalamos pnpm globalmente
RUN npm install -g pnpm

# Copiamos archivos de dependencias desde la raíz del monorepo
# Para el Dockerfile del frontend, necesitamos acceso a los archivos de la raíz
# Pero como el contexto suele ser la carpeta frontend, lo ideal es construir desde la raíz.
# Sin embargo, el manual MI-DES-GUI-001 sugiere Dockerfiles dentro de cada carpeta.

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/
RUN pnpm install --filter frontend... --frozen-lockfile

COPY frontend ./frontend
RUN pnpm --filter frontend build

# Stage 2: Serve
FROM nginx:stable-alpine
# Ajustamos la ruta según donde Angular genere el build (dist/frontend/browser por defecto en v17+)
COPY --from=builder /app/frontend/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
