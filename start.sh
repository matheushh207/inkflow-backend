#!/bin/sh

# Parar imediatamente em caso de erro
set -e

echo "==> Iniciando script de inicialização do backend..."

# Diagnóstico e Correção de Conexão (Ocultando senha)
fix_url() {
    local url=$1
    if [[ "$url" == *"&sslmode=require"* ]] && [[ "$url" != *"?"* ]]; then
        echo "$url" | sed 's/&sslmode=require/?sslmode=require/'
    else
        echo "$url"
    fi
}

if [ -n "$DIRECT_URL" ]; then
  # Corrigir typos comuns de & em vez de ?
  ORIGINAL_DIRECT_URL=$DIRECT_URL
  export DIRECT_URL=$(fix_url "$DIRECT_URL")
  if [ "$ORIGINAL_DIRECT_URL" != "$DIRECT_URL" ]; then
    echo "==> CORREÇÃO: Corrigido '&sslmode' para '?sslmode' na DIRECT_URL."
  fi

  # Extrair o host da URL para teste de rede
  DB_HOST=$(echo $DIRECT_URL | sed -e 's|.*@||' -e 's|:.*||' -e 's|/.*||')
  echo "==> Testando conexão de rede com o host: $DB_HOST na porta 5432..."
  
  # Tenta pingar a porta 5432
  if nc -zv $DB_HOST 5432 2>&1 | grep -q "open"; then
    echo "==> Sucesso: Porta 5432 está acessível."
  else
    echo "==> ERRO: Não foi possível alcançar a porta 5432 no host $DB_HOST."
    echo "==> MOTIVO PROVÁVEL: O Render não suporta IPv6 e seu hostname do Supabase pode ser IPv6."
    echo "==> SOLUÇÃO: Vá no Supabase -> Settings -> Database e COPIE o hostname do 'Connection Pooler' (IPv4) ou use o endereço IP direto."
    echo "==> O hostname atual parece ser incompatível com a rede do Render."
  fi
fi

if [ -n "$DATABASE_URL" ]; then
  export DATABASE_URL=$(fix_url "$DATABASE_URL")
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
    echo "==> ERRO NAS MIGRAÇÕES: P1001 Geralmente significa host inacessível."
    echo "==> Certifique-se de estar usando o hostname IPv4 do Supabase."
    exit 1
  fi
  
  echo "==> Executando seed do banco de dados..."
  npx prisma db seed
else
  echo "[AVISO] DATABASE_URL não encontrada. Pulando migrações."
fi

echo "==> Iniciando a aplicação com npm run start:prod..."
exec npm run start:prod
