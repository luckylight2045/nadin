FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install --ignore-scripts

COPY . .

EXPOSE 3000

CMD [ "pnpm", "run", "start:dev" ]