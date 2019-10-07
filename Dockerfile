FROM node:12-alpine

EXPOSE 3000

ENV NODE_ENV="default"

WORKDIR /usr/src/app

COPY .babelrc .
COPY bin .
COPY public .
COPY src .

COPY package.json .

RUN yarn global add babel-node
RUN yarn install --production=true

CMD [ "./node_modules/.bin/babel-node", "index.js"]
