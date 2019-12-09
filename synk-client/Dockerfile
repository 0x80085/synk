# Stage 1
# Build the WebApp

FROM node:13 as build-ngx

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

FROM nginx as serve-ngx

# Copy app to Nginx server
COPY --from=build-ngx /synk-client/dist/synk-client /usr/share/nginx/html

# Configure Nginx
COPY --from=build-ngx /synk-client/custom-nginx.conf /etc/nginx/conf.d

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf
