# Estágio 1: Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências primeiro (aproveita cache do Docker)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o resto do código e gera o build (dist)
COPY . .
RUN npm run build

# Estágio 2: Servidor Web Leve (Nginx)
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração customizada
COPY nginx.conf /etc/nginx/conf.d/

# Copia os arquivos finais do React para a pasta pública do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# A infraestrutura da Unifesp espera a porta 3838!
EXPOSE 3838

CMD ["nginx", "-g", "daemon off;"]
