# Build/package the API src

FROM node:lts-alpine

# Create folder on container
WORKDIR /synk-api

# Copy build config files to container
COPY package*.json ./
COPY .env ./
COPY ormconfig.json ./
COPY tsconfig.json ./

# Install deps
RUN npm install

# Copy src
COPY ./src ./src

# Compile code (will put res in /dist)
RUN tsc
