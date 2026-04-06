FROM node:22.14.0

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .


# Exponer puerto
EXPOSE 3000

# Ejecutar app
CMD ["npm", "run", "dev"]