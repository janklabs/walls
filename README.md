# Walls

Beautiful backgrounds for your screens. A wallpaper sharing platform built with the [T3 Stack](https://create.t3.gg/).

## Features

- Browse a public gallery of wallpapers with a masonry-style layout
- Upload wallpapers via drag-and-drop or by pasting an image URL
- NSFW content filtering (None / Mild / All)
- Email magic link authentication (passwordless)
- User profiles and personal wallpaper collections
- Admin mode for managing all wallpapers
- Dark / light theme toggle

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- [React 19](https://react.dev)
- [NextAuth.js v5](https://authjs.dev) (email magic link provider)
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

## Environment Variables

| Variable         | Required   | Description                                                                   |
| ---------------- | ---------- | ----------------------------------------------------------------------------- |
| `AUTH_URL`       | Yes        | Public-facing URL of the app (used by NextAuth for callbacks and magic links) |
| `AUTH_SECRET`    | Production | NextAuth secret — generate with `npx auth secret`                             |
| `SMTP_HOST`      | Yes        | SMTP server hostname                                                          |
| `SMTP_PORT`      | No         | SMTP port (default `587`)                                                     |
| `SMTP_USERNAME`  | Yes        | SMTP auth username                                                            |
| `SMTP_PASSWORD`  | Yes        | SMTP auth password                                                            |
| `SMTP_MAIL_FROM` | Yes        | Sender email address for magic link emails                                    |
| `DATABASE_URL`   | Yes        | PostgreSQL connection string                                                  |

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

## Deployment

The project includes a multi-stage `Dockerfile` and GitHub Actions workflows for CI/CD:

- **PR checks**: Docker build test, Prettier format check, npm build
- **Push to main**: Semantic release, Docker build + push, SSH deploy to VPS
