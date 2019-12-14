# Build the WebApp

FROM node:13 AS build-ngx

# Stage 1

# Create build folder on container
WORKDIR /synk-client

# Copy build config files to container
COPY ./package*.json ./
COPY ./tsconfig*.json ./
COPY ./angular.json ./

# Copy Nginx config to container
COPY ./custom-nginx.conf ./

# Copy src to build-stage container
COPY ./src ./src

# Install dependencies
RUN npm install

# Run the build
RUN npm run build


# Stage 2
# Copy build results to server and configure Nginx

FROM nginx AS serve-ngx

## Install unzip
RUN apt-get update && apt-get install -y \
  unzip

# Copy web app package to Nginx server
COPY --from=build-ngx /synk-client/dist/synk-client /usr/share/nginx/html

# Place config for nginx
# Taken from https://www.digitalocean.com/community/tools/nginx#
COPY ./nginx/nginxconfig.io-synk.tv.zip /etc/nginx
RUN unzip -o /etc/nginx/nginxconfig.io-synk.tv.zip
