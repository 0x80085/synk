# THIS FILE IS NOT ACTIVELY MAINTAINED

# Build the WebApp

FROM node:13 AS build-ngx

ENV SYNK_API_URL=http://localhost:3000

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

# Replace __SYNK_API_URL__ in both env files to be sure
RUN sed -i "s|__SYNK_API_URL__|${SYNK_API_URL}|g" ./src/environments/environment.prod.ts
RUN sed -i "s|__SYNK_API_URL__|${SYNK_API_URL}|g" ./src/environments/environment.ts

# Install dependencies
RUN npm install

# Run the build
RUN npm run build


# Stage 2
# Copy build results to server and configure Nginx

FROM nginx AS serve-ngx

# Copy app to Nginx server
COPY --from=build-ngx /synk-client/dist/synk-client /usr/share/nginx/html

# Configure Nginx
COPY --from=build-ngx /synk-client/custom-nginx.conf /etc/nginx/conf.d

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf
