FROM node:8.16-alpine

ARG NPM_TOKEN
ENV NODE_ENV="production"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


COPY bin bin
COPY messaging messaging
COPY public public
COPY routes routes
COPY twitterApi twitterApi
COPY views views

COPY server.js .
COPY authentication.js .
COPY configurations.js .
COPY external_logins.js .
COPY package.json .
COPY passport.config.js .
COPY .npmrc .npmrc

RUN npm install --production --no-optional
RUN rm -f .npmrc

CMD [ "npm", "start" ]
