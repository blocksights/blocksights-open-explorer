# Open Source Bitshares Explorer

http://open-explorer.io

## Install

A node and npm installation on your machine is assumed. Checkout this repository and install the dependencies

```
npm install
```

Start development serverwill listen to http://localhost:9000:

```
npm start
```

Build production bundle with

```
npm run start:build
```

## Run as docker

A docker and docker-compose installation on your machine is assumed. The docker file creates the necessary environment, builds
the explorer and runs it through nginx listen on your host machine to http://localhost:9000:

Run the docker

```
docker-compose up
```

Rebuild the image

```
docker-compose build
```