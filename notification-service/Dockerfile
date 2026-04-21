FROM node:22.14.0

WORKDIR /home/app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY src ./src
#COPY .env ./

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]