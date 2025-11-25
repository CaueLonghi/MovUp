# FRONT - Node.js
FROM node:18

# Diretório da aplicação
WORKDIR /app

# Copia apenas o package* primeiro para aproveitar cache
COPY package*.json ./

# Instalando dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Porta usada pelo app
EXPOSE 3000

# Comando para subir o projeto
CMD ["npm", "run", "dev"]
