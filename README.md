# Picpok

Picpok is a full-screen vertical image feed: TikTok/Reels interaction, but for photos.

The app is built for a take-home assignment. The core product choice is simple: anyone can browse the feed without logging in, but liking a photo requires a lightweight username/password account so likes can persist per user.

## Features

- **TypeScript** - Type-safe application code.
- **TanStack Start** - React SSR framework with TanStack Router.
- **TailwindCSS** - Utility-first styling.
- **tRPC** - End-to-end type-safe API calls.
- **Drizzle** - TypeScript ORM for persisted users, sessions, and likes.
- **PostgreSQL** - Database engine.
- **Pexels API** - Real paginated image data proxied through the backend.
- **Lightweight auth** - Username/password auth for persisted likes.
- **Biome** - Linting and formatting.
- **Turborepo** - Monorepo task runner.

## Assignment Scope

- Full-screen snap-scrolling vertical photo feed.
- Real image data from Pexels.
- Server-side API proxy so the Pexels key is not exposed to the browser.
- Infinite loading before the user reaches the end.
- Anonymous browsing.
- Login-required likes persisted per user.
- Visible loading, empty, and error states.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create an environment file from the example:

```bash
cp .env.example .env
```

Set `PEXELS_API_KEY` to a Pexels API key. The app calls Pexels from the backend only.

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

Apply the schema to your database:

```bash
pnpm run db:push
```

Run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Planning Docs

- `PLAN.md` captures the implementation plan and product decisions.
- `AI_WORKFLOW.md` captures how AI tools were used during the assignment.

## Known Tradeoffs

- Browsing is anonymous, but liking requires login.
- Auth is username/password only; email confirmation and password reset are intentionally out of scope.
- The feed is the product focus, so extra social features like comments, profiles, and uploads are intentionally excluded.

## Project Structure

```txt
picpok/
├── apps/
│   └── web/         # Fullstack app: React + TanStack Start
├── packages/
│   ├── api/         # tRPC API layer and business logic
│   ├── auth/        # Existing auth package from scaffold
│   ├── db/          # Drizzle/PostgreSQL schema and database client
│   ├── env/         # Environment validation
│   └── ui/          # Shared UI primitives and styles
```

## Available Scripts

- `pnpm run dev` - Start all applications in development mode.
- `pnpm run dev:web` - Start only the web application.
- `pnpm run check` - Run Biome formatting and linting.
- `pnpm run check-types` - Check TypeScript types across all apps.
- `pnpm run db:push` - Push schema changes to the database.
- `pnpm run db:generate` - Generate database migrations.
- `pnpm run db:migrate` - Run database migrations.
- `pnpm run db:studio` - Open database studio UI.
