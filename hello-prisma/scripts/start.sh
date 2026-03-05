#!/bin/sh
set -e

echo "[startup] NODE_ENV=${NODE_ENV:-not-set} PORT=${PORT:-not-set}"

if [ -z "${DATABASE_URL}" ]; then
  echo "[startup] DATABASE_URL não está definida. Subindo API sem migrations."
else
  echo "[startup] Executando Prisma migrate deploy..."
  if npx prisma migrate deploy; then
    echo "[startup] Migrations aplicadas com sucesso."
  else
    echo "[startup] Falha ao aplicar migrations. API será iniciada mesmo assim para facilitar diagnóstico."
  fi
fi

echo "[startup] Iniciando servidor Node..."
exec node dist/server.js
