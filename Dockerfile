FROM node:18-alpine AS frontend
WORKDIR /frontend
COPY react-app/package*.json ./
RUN npm ci
COPY react-app/ .
RUN npx react-scripts build

FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --production
COPY server/ .
COPY --from=frontend /frontend/build ./public
EXPOSE 8080
CMD ["node", "app.js"]