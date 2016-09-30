FROM node

EXPOSE 3000

ARG NPM_TOKEN
ENV NODE_ENV="production"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


COPY bin bin
COPY messaging messaging
COPY public public
COPY routes routes
COPY views views

COPY app.js .
COPY authentication.js .
COPY configurations.js .
COPY external_logins.js .
COPY package.json .
COPY passport.config.js .
COPY .npmrc .npmrc

RUN npm install --production --no-optional
RUN rm -f .npmrc

CMD [ "npm", "start" ]