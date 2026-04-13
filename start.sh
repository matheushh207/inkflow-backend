#!/bin/sh

# Parar imediatamente em caso de erro
set -e

echo "==> Iniciando script de inicialização do backend..."

# Executar migrações do Prisma apenas se as URLs estiverem presentes
if [ -n "$DATABASE_URL" ]; then
  echo "==> Aplicando migrações do banco de dados..."
  # O migrate deploy deve usar a DIRECT_URL se estiver configurada no schema
  npx prisma migrate deploy
  
  echo "==> Executando seed do banco de dados..."
  npx prisma db seed
else
  echo "[AVISO] DATABASE_URL não encontrada. Pulando migrações."
fi

echo "==> Iniciando a aplicação com npm run start:prod..."
exec npm run start:prod
