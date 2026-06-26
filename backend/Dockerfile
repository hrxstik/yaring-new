FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
ARG APP
RUN npx nest build ${APP}

FROM node:20-alpine
WORKDIR /app
ARG APP
ENV APP=${APP}
COPY --from=builder /app/dist/apps/${APP}/main.js ./main.js
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["node", "main.js"]
