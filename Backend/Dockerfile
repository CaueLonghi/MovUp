FROM node:18-slim

# Criar diretório da aplicação
WORKDIR /app

# Copiar apenas package.json para otimizar cache
COPY package*.json ./

# Instalar dependências
RUN npm install


# Copiar o restante do projeto
COPY . .

RUN npx prisma generate

# Expor porta do servidor
EXPOSE 8080

# Comando de inicialização
CMD ["npx", "prisma.js","generate"]
CMD ["node", "server.js"]
