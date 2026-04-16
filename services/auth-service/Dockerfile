FROM node:22.14.0-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate
RUN npm run build

FROM node:22.14.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]