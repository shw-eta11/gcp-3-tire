FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json ./
RUN npm install

COPY . .

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN npm run build

EXPOSE 8080

CMD ["npx", "serve", "-s", "build", "-l", "8080"]