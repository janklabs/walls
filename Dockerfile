FROM node:22-alpine AS build

COPY package.json /src/package.json
COPY package-lock.json /src/package-lock.json

WORKDIR /src
RUN npm ci
COPY . /src
RUN SKIP_ENV_VALIDATION=1 npm run build

FROM node:22-alpine

COPY --from=build /src/.next/standalone /app
COPY --from=build /src/.next/static /app/.next/static
COPY --from=build /src/public /app/public

EXPOSE 3000
WORKDIR /app
ENTRYPOINT [ "node", "server.js" ]
