# Builds/packages the API for production

FROM node:lts-alpine AS builder

# Stage 0
# -- Prepare host

# Add NGINX for load balancing
RUN apk update
RUN apk add nginx

# Install pkgs to build npm deps
RUN apk add --no-cache --virtual .gyp \
  python \
  make \
  g++

# Stage 1
# -- Compile

WORKDIR /synk-api/build

# Copy build config files to container
COPY package*.json ./
COPY ./.env.docker ./.env
COPY tsconfig.json ./

# Install deps
RUN npm install
RUN npm install typescript -g

# Copy src
COPY ./src ./src
COPY ./nginx ./nginx

RUN tsc

## Done Building

# Stage 2
# -- Launch

# https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production
ENV NODE_ENV=production

WORKDIR /synk-api/server

# Copy build results to server and configure Nginx
# -- With bash cp command. Because we're still inside the same container we built the app
RUN cp -a /synk-api/build/dist/. ./
RUN cp -a /synk-api/build/package*.json ./
RUN cp -a /synk-api/build/.env ./

# Install deps
RUN npm install
RUN npm install -g pm2

# Configure Nginx
RUN cp -r /synk-api/build/nginx/custom.conf /etc/nginx/conf.d

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# # Remove build folder
# RUN rm -f /synk-api/build

CMD ["pm2-runtime", "index.js"]
