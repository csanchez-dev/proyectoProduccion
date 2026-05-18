FROM node:22.14.0-alpine AS builder
# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
# tsconfig.json might not be in the root of agenda-service, checking...
COPY . .
RUN npm install
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate
RUN npm run build

FROM node:22.14.0-alpine
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["npm", "start"]