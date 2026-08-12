# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────────────────────
# Base — dependências de sistema comuns a todos os estágios
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
# O healthcheck do compose usa wget; a imagem alpine do node não o traz.
RUN apk add --no-cache wget

# ─────────────────────────────────────────────────────────────────────────────
# Deps — instala TODAS as dependências (inclui dev, necessárias para compilar)
# Copiamos só os manifestos primeiro: enquanto o package.json não mudar,
# o Docker reaproveita esta camada e pula o npm ci inteiro.
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ─────────────────────────────────────────────────────────────────────────────
# Development — hot reload via tsx, código montado como volume pelo compose
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS development
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────────────────────────────────────────
# Build — compila TypeScript para dist/
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Production — só o necessário para rodar
# Imagem final sem TypeScript, sem código-fonte e sem dependências de dev.
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

# Nunca rodar como root: se a aplicação for comprometida, o atacante herda
# um usuário sem privilégios.
USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]
