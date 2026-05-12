# Etapa 1: Compilación
FROM node:20-alpine AS build
WORKDIR /app

# 1. Copia solo los archivos de dependencias primero
COPY package*.json ./

# 2. Instala las dependencias (esto crea la carpeta node_modules)
RUN npm install

# 3. Copia el resto del código
COPY . .

# 4. Ahora sí, compila
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
