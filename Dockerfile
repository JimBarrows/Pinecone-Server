FROM node

EXPOSE 3000

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


COPY bin bin
COPY messaging messaging
COPY public public
COPY routes routes
COPY views views
COPY app.js .
COPY authentication.js .
COPY external_logins.js .
COPY package.json .
COPY passport.config.js .

npm install


CMD [ "npm", "start" ]