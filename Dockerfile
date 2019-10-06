FROM node:8.16-alpine

ARG NPM_TOKEN
ENV NODE_ENV="production"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


COPY bin bin
COPY src/messaging messaging
COPY public public
COPY src/routes routes
COPY src/twitterApi twitterApi
COPY src/views views

COPY src/server.js .
COPY src/authentication.js .
COPY src/config.js .
COPY src/external_logins.js .
COPY package.json .
COPY passport.config.js .
COPY .npmrc .npmrc

RUN npm install --production --no-optional
RUN rm -f .npmrc

CMD [ "npm", "start" ]
