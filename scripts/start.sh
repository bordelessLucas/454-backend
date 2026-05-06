#!/bin/sh
set -e

echo "[startup] NODE_ENV=${NODE_ENV:-not-set} PORT=${PORT:-not-set}"
echo "[startup] DATABASE_URL=${DATABASE_URL:+***configurada***}"

if [ -z "${DATABASE_URL}" ]; then
  echo "[startup] ❌ DATABASE_URL não está definida!"
  echo "[startup] Configure a variável de ambiente DATABASE_URL no Render."
  exit 1
fi

# Render: host interno "dpg-xxx-a" costuma falhar no Docker sem DB linkado — expandir para .oregon-postgres.render.com
export DATABASE_URL="$(node ./scripts/normalize-render-database-url.mjs)"

echo "[startup] ✅ DATABASE_URL encontrada"
echo "[startup] Executando Prisma migrate deploy..."

if ! npx prisma migrate deploy; then
  echo "[startup] ❌ prisma migrate deploy falhou — abortando."
  echo "[startup] Dica Render (P1001): hostname só 'dpg-xxx-a' (internal) pode falhar se DB e Web não estão na mesma rede/workspace."
  echo "[startup] Use na env DATABASE_URL a External Database URL do Postgres e acrescente ?sslmode=require no final."
  echo "[startup] Confira também se o Postgres free não está suspenso (abra o DB no painel para ‘acordar’)."
  exit 1
fi
echo "[startup] ✅ Migrations aplicadas com sucesso."

echo "[startup] ✅ Iniciando servidor Node na porta ${PORT:-3000}..."
exec node dist/server.js
