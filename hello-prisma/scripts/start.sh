#!/bin/sh
set -e

echo "[startup] NODE_ENV=${NODE_ENV:-not-set} PORT=${PORT:-not-set}"
echo "[startup] DATABASE_URL=${DATABASE_URL:+***configurada***}"

if [ -z "${DATABASE_URL}" ]; then
  echo "[startup] ❌ DATABASE_URL não está definida!"
  echo "[startup] Configure a variável de ambiente DATABASE_URL no Render."
  exit 1
fi

echo "[startup] ✅ DATABASE_URL encontrada"
echo "[startup] Executando Prisma migrate deploy..."

if npx prisma migrate deploy; then
  echo "[startup] ✅ Migrations aplicadas com sucesso."
else
  MIGRATE_EXIT=$?
  echo "[startup] ⚠️  Falha ao aplicar migrations (exit code: $MIGRATE_EXIT)"
  echo "[startup] Continuando com startup mesmo assim..."
fi

echo "[startup] ✅ Iniciando servidor Node na porta ${PORT:-3000}..."
exec node dist/server.js
