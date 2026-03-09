FROM node:16 AS builder

# Install nginx
RUN apt-get update \
  && apt-get install -y nginx --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN npm install -g cross-env

CMD mkdir /open-explorer
WORKDIR /open-explorer

COPY ./entry.js ./html.js ./package.json ./yarn.lock ./webpack.config.js /open-explorer/
COPY ./app /open-explorer/app

RUN yarn install

RUN yarn build

FROM nginx:1.19-alpine AS server

ARG BUILD_DATE
LABEL BUILD_DATE=$BUILD_DATE
ARG VCS_REF
LABEL VCS_REF=$VCS_REF

COPY ./nginx.prod.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /open-explorer/dist /usr/share/nginx/html