# Stage 1: Build React App
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Pass the backend API base URL in at build time (CRA bakes REACT_APP_* vars
# into the static bundle at build time, not at container runtime).
# Example: docker build --build-arg REACT_APP_API=https://api.example.com .
ARG REACT_APP_API
ENV REACT_APP_API=$REACT_APP_API

RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Custom config: SPA fallback routing + basic security headers
COPY default.conf /etc/nginx/conf.d/default.conf

# React build output
COPY --from=build /app/build /usr/share/nginx/html

# Prevent directory listings and ensure correct permissions
RUN chmod -R 755 /usr/share/nginx/html

# nginx:alpine ships a non-root 'nginx' user, but the master process and
# config dirs are root-owned by default. Adjust ownership so nginx can run
# as a non-root user end-to-end instead of as root inside the container.
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
