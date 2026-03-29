# Walls

Beautiful backgrounds for your screens. A wallpaper sharing platform built with the [T3 Stack](https://create.t3.gg/).

## Features

- Browse a public gallery of wallpapers with a masonry-style layout
- Upload wallpapers via drag-and-drop or by pasting an image URL
- NSFW content filtering (None / Mild / All)
- Email magic link authentication (passwordless)
- User profiles and personal wallpaper collections
- Invite-only mode with access request flow
- Admin mode for managing users, invites, and wallpapers
- Dark / light theme toggle

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- [React 19](https://react.dev)
- [better-auth](https://www.better-auth.com) (magic link email authentication)
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Sharp](https://sharp.pixelplumbing.com) for image processing

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL database
- SMTP server for magic link emails

### Setup

```bash
# Install dependencies
npm ci

# Copy environment variables and fill in your values
cp .env.example .env

# Push the database schema
npm run db:push

# Start the dev server
npm run dev
```

### Docker Compose

A sample `docker-compose.yml` for running Walls with PostgreSQL and [Mailpit](https://mailpit.axllent.org) (local SMTP server for development):

```yaml
services:
  walls:
    build:
      context: .
      args:
        BUILD_VERSION: dev
    ports:
      - "3000:3000"
    environment:
      AUTH_URL: "http://localhost:3000"
      AUTH_SECRET: "change-me-to-a-random-secret"
      APP_URL: "http://localhost:3000"
      SMTP_HOST: mailpit
      SMTP_PORT: "1025"
      SMTP_USERNAME: ""
      SMTP_PASSWORD: ""
      SMTP_MAIL_FROM: "noreply@localhost"
      DATABASE_URL: "postgresql://walls:walls@db:5432/walls"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: walls
      POSTGRES_PASSWORD: walls
      POSTGRES_DB: walls
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U walls"]
      interval: 5s
      timeout: 5s
      retries: 5

  mailpit:
    image: axllent/mailpit
    ports:
      - "8025:8025" # Web UI
      - "1025:1025" # SMTP

volumes:
  pgdata:
```

Run with:

```bash
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000) for the app and [http://localhost:8025](http://localhost:8025) for the Mailpit inbox to view magic link emails.

> **Note:** On first run you'll need to push the database schema. You can do this by running `npm run db:push` locally with `DATABASE_URL` pointed at the containerized Postgres, or by adding a migration step to the compose setup.

## Environment Variables

| Variable         | Required   | Description                                                       |
| ---------------- | ---------- | ----------------------------------------------------------------- |
| `AUTH_URL`       | Yes        | Public-facing URL of the app (used by better-auth for callbacks)  |
| `AUTH_SECRET`    | Production | Auth secret — generate with `openssl rand -base64 32`             |
| `APP_URL`        | No         | App URL used in invite emails (defaults to `AUTH_URL` if not set) |
| `SMTP_HOST`      | Yes        | SMTP server hostname                                              |
| `SMTP_PORT`      | No         | SMTP port (default `587`)                                         |
| `SMTP_USERNAME`  | Yes        | SMTP auth username                                                |
| `SMTP_PASSWORD`  | Yes        | SMTP auth password                                                |
| `SMTP_MAIL_FROM` | Yes        | Sender email address for magic link emails                        |
| `DATABASE_URL`   | Yes        | PostgreSQL connection string                                      |

See [`.env.example`](.env.example) for a full template.

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start dev server (Turbopack)         |
| `npm run build`        | Production build                     |
| `npm run start`        | Start production server              |
| `npm run preview`      | Build + start                        |
| `npm run db:generate`  | Generate Drizzle migrations          |
| `npm run db:migrate`   | Run Drizzle migrations               |
| `npm run db:push`      | Push schema directly to the database |
| `npm run db:studio`    | Open Drizzle Studio                  |
| `npm run check`        | ESLint + TypeScript type-check       |
| `npm run format:check` | Prettier format check                |
| `npm run format:write` | Prettier auto-format                 |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on setting up a development environment and submitting changes.

## Deployment

The project includes a multi-stage `Dockerfile` and GitHub Actions workflows for CI/CD:

- **PR checks**: Docker build test, Prettier format check, npm build
- **Push to main**: Semantic release, Docker build + push, SSH deploy to VPS
