FROM node:latest

RUN mkdir -p /usr/src/telegram
WORKDIR /usr/src/telegram

COPY package.json ./
RUN npm install

COPY . /usr/src/telegram

CMD ["npm", "start"]