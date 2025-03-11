FROM node:lts-slim

WORKDIR /app

# Install iproute2 for 'ip monitor' command
RUN apt-get update && apt-get install -y iproute2 && rm -rf /var/lib/apt/lists/*

COPY package.json watch-ipv6.js ./

CMD ["node", "watch-ipv6.js"]
