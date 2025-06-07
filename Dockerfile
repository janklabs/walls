FROM oven/bun:1 AS build

COPY package.json /src/package.json
COPY bun.lock /src/bun.lock

WORKDIR /src
RUN bun install --frozen-lockfile
COPY . /src
RUN SKIP_ENV_VALIDATION=1 bun run build

FROM oven/bun:1

COPY --from=build /src/.next/standalone /app
COPY --from=build /src/.next/static /app/.next/static
COPY --from=build /src/public /app/public

EXPOSE 3000
WORKDIR /app
ENTRYPOINT [ "bun", "run", "server.js" ]
