# Builds/packages the API

FROM node:lts-alpine

# Install pkgs to build npm deps
RUN apk add --no-cache --virtual .gyp \
    python \
    make \
    g++

# Create folder on container
WORKDIR /synk-api

# Copy build config files to container
COPY package*.json ./
COPY .env ./
COPY ormconfig.docker.json ./ormconfig.json
COPY tsconfig.json ./

# Install deps
RUN npm install

# Copy src
COPY ./src ./src

# Run dev start
CMD ["npm", "start"]
