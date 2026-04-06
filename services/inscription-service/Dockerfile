# Dockerfile - inscripcion-service
FROM node:22.14.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002

CMD ["npx", "ts-node-dev", "--esm", "--respawn", "src/server.ts"]