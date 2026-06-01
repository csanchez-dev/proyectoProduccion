FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY . .
RUN npm install
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npm exec -- prisma generate --schema=./prisma/schema.prisma
RUN npm run build

FROM node:20-slim
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3002
CMD ["npm", "start"]