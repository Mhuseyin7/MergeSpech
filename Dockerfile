FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
FROM deps AS build
COPY . .
RUN npm run db:generate && npm run build
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
USER node
CMD ["node", "server.js"]
