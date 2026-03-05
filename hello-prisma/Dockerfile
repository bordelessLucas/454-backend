# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar OpenSSL (necessário para o Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client e compilar TypeScript
RUN npm run prisma:generate && npm run build

# Stage 2: Runtime
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar arquivos compilados do estágio anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expor a porta
EXPOSE 3000

# Comando para rodar migrations e iniciar o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
