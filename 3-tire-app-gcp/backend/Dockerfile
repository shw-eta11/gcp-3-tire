FROM node:20-alpine

WORKDIR /app

# install curl for ECS health check
RUN apk add --no-cache curl

COPY package.json ./
RUN npm install

COPY . ./

EXPOSE 4000

CMD ["node", "index.js"]
