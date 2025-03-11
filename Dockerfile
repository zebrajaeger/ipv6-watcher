FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY watch-ipv6.js ./

CMD ["node", "watch-ipv6.js"]

