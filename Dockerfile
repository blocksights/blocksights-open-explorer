FROM node:12

# Install nginx
RUN apt-get update \
  && apt-get install -y nginx --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN npm install -g cross-env

CMD mkdir /open-explorer
WORKDIR /open-explorer

COPY ./entry.js ./html.js ./package.json ./package-lock.json ./webpack.config.js /open-explorer/
COPY ./app /open-explorer/app

RUN cross-env npm install --env.prod

RUN cross-env npm run start:build

RUN cp -a /open-explorer/dist/. /var/www/html/

