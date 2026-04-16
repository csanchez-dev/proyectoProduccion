FROM node:22.14.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install
RUN npm run build

FROM node:22.14.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]