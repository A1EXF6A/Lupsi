# Gestion Monorepo

Monorepo PNPM que contiene una API NestJS (`backend`) y un frontend Angular (`frontend`). Todo se maneja con PNPM Workspaces desde la raíz.

## Requisitos

- Node.js 20+
- PNPM 10.30.0

## Instalación

```bash
pnpm i
```

Esto instala dependencias de todos los paquetes. Si necesitas reinstalar todo desde cero, usa `pnpm bootstrap` (ejecuta `pnpm install --recursive`).

## Scripts principales

- `pnpm -r dev`: corre todos los paquetes que tengan script `dev`.
- `pnpm frontend:start`: levanta solo el frontend (Angular).
- `pnpm backend:start` y `pnpm backend:dev`: levanta el backend NestJS (por defecto puerto 3000 o `PORT`).
- `pnpm -r build` / `pnpm -r test`: ejecutan `build` o `test` en cada paquete.

## Docker (Entorno Local)

Siguiendo el estándar **MI-DES-GUI-001**, el proyecto utiliza Docker para orquestar los servicios. 

### Ejecución con Docker
Para levantar todo el entorno (Frontend + Backend):
```bash
docker-compose -f docker/docker-compose.yml up --build
```
- **Backend:** `http://localhost:3000`
- **Frontend:** `http://localhost:8080` (Cerrado a producción en el contenedor)

## Estructura del Proyecto
```text
/lupsi
  /backend    # API NestJS
  /frontend   # PWA Angular
  /docker     # Orquestación (docker-compose)
  /docs       # Documentación técnica
  README.md   # Guía general
```

## Buenas prácticas
...

- No subas `node_modules` (ya está en `.gitignore`).
- Usa siempre `pnpm` desde la raíz para mantener el lockfile sincronizado.
- Define variables de entorno en archivos `.env` locales (ya ignorados).
- Antes de subir código, corre los builds/tests que toquen tu parte.

## Ports

- Backend: `PORT` o 3000 por defecto.
- Frontend (Angular CLI): 4200 por defecto.

## FAQ rápida

- **¿PNPM se cuelga al instalar?** Asegúrate de no ejecutar el script `bootstrap` automáticamente; solo `pnpm install`.
- **¿Cómo agrego un nuevo paquete?** Crea una carpeta con su `package.json` y agrégalo al `pnpm-workspace.yaml`.
