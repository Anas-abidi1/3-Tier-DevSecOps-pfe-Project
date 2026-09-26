FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# node:22-alpine ships a non-root 'node' user — use it instead of root.
RUN chown -R node:node /app
USER node

EXPOSE 5000
CMD ["node", "app.js"]
