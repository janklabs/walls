FROM oven/bun AS base

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY . .

RUN SKIP_ENV_VALIDATION=1 bun run build

EXPOSE 3000

ENTRYPOINT ["bun", "run", "start"]
