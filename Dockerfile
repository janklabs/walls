FROM oven/bun:latest as base

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY . .

RUN bun run build

EXPOSE 3000

ENTRYPOINT ["bun", "run", "start"]
