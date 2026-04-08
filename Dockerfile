FROM node:20-alpine

# Instalar dependências do Chromium para Puppeteer
# Baseado em https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-alpine
RUN apk add --no-cache udev chromium nss freetype freetype-dev harfbuzz ca-certificates openssl

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copiar package.json e package-lock.json do BACKEND para instalar dependências
COPY backend/package*.json ./

# Instalar dependências do Node.js
RUN npm install

# Copiar o restante do código do BACKEND
COPY backend/ .

# Gerar cliente Prisma
RUN npx prisma generate

# Construir a aplicação NestJS
RUN npm run build

# Expor a porta que a aplicação NestJS escuta (3000 por padrão)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]
