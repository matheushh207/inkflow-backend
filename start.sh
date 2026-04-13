#!/bin/sh

# Parar imediatamente em caso de erro
set -e

echo "==> Iniciando script de inicialização do backend..."

# Diagnóstico de Conexão (Ocultando senha)
if [ -n "$DIRECT_URL" ]; then
  # Extrair o host da URL para teste de rede
  DB_HOST=$(echo $DIRECT_URL | sed -e 's|.*@||' -e 's|:.*||')
  echo "==> Testando conexão de rede com o host: $DB_HOST na porta 5432..."
  
  # Tenta pingar a porta 5432
  if nc -zv $DB_HOST 5432 2>&1 | grep -q "open"; then
    echo "==> Sucesso: Porta 5432 está acessível."
  else
    echo "==> AVISO: Não foi possível alcançar a porta 5432 no host $DB_HOST."
    echo "==> Verifique se o IP do Render está liberado no Supabase ou use o endereço IPv4 direto."
  fi
fi

# Executar migrações do Prisma apenas se as URLs estiverem presentes
if [ -n "$DATABASE_URL" ]; then
  echo "==> Aplicando migrações do banco de dados..."
  # Adiciona timeout extra para conexões lentas no Render
  export PRISMA_CLIENT_ENGINE_TYPE='library'
  
  # Executa a migração
  if npx prisma migrate deploy; then
    echo "==> Migrações aplicadas com sucesso."
  else
    echo "==> ERRO nas migrações. Verifique se a DIRECT_URL termina com '?sslmode=require' (com interrogação)."
    exit 1
  fi
  
  echo "==> Executando seed do banco de dados..."
  npx prisma db seed
else
  echo "[AVISO] DATABASE_URL não encontrada. Pulando migrações."
fi

echo "==> Iniciando a aplicação com npm run start:prod..."
exec npm run start:prod
