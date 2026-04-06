# Dockerfile - agenda-service
FROM node:22.14.0

WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar todo el código
COPY . .

# Exponer el puerto del servicio
EXPOSE 3001

# Comando para desarrollo
CMD ["npx", "ts-node-dev", "--esm", "--respawn", "src/server.ts"]