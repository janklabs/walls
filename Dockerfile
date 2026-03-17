FROM node:22-alpine AS build

ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION}

COPY package.json /src/package.json
COPY package-lock.json /src/package-lock.json

WORKDIR /src
RUN npm ci

COPY . /src

RUN npm run build

FROM node:22-alpine

COPY --from=build /src/.next/standalone /app
COPY --from=build /src/.next/static /app/.next/static
COPY --from=build /src/public /app/public

EXPOSE 3000
WORKDIR /app
ENV HOSTNAME=0.0.0.0
ENTRYPOINT [ "node", "server.js" ]
