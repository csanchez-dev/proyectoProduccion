FROM node:20-slim AS builder
# Install dependencies for Prisma
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
# tsconfig.json might not be in the root of agenda-service, checking...
COPY . .
RUN npm install
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npm exec -- prisma generate --schema=./prisma/schema.prisma
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["npm", "start"]