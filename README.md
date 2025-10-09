# Event Manager (T3 Stack)

## Quick overview (what's in this repo)

- Next.js app in `src/app`
- Authentication with `next-auth` (here's the steps if you wanna try this Discord provider configured https://create.t3.gg/en/usage/first-steps)
- Database + ORM: Prisma (schema in `prisma/schema.prisma`) using MySQL
- Tailwind for styles
- tRPC for type-safe server/client endpoints

## 1) Clone the repository

Just clone the repository from gitlab

## 2) Install dependencies

In your terminal run:

```powershell
npm install
```

## 3) database (Prisma)

The project uses Prisma and a MySQL database. There are two common workflows:

- Development (runs migrations and generates the Prisma client):

```powershell
npm run db:generate
```

This script runs `prisma migrate dev` which will apply migrations (it may prompt for a migration name the first time). It also generates the Prisma client.

- If you already have the schema in sync and only want to push the schema without generating a migration (less common for production):

```powershell
npm run db:push
```

You can inspect and edit your data using Prisma Studio:

```powershell
npm run db:studio
```

If you are using the Docker MySQL example above, `prisma migrate dev` should be able to connect using the `DATABASE_URL` in `.env`. If prisma cannot create the database, make sure the database `event_manager` exists or create it manually in MySQL.

## 5) Run the app (development)

Start the Next.js dev server:

```powershell
npm run dev
```

Open your browser at http://localhost:3000

The app uses NextAuth for authentication. If you set Discord provider variables and callback URLs correctly in your Discord application settings, sign-in should work.

## Build & Preview (production-like)

Build and preview with:

```powershell
npm run preview
```

Or build only:

```powershell
npm run build
npm run start
```

## Useful npm scripts (from package.json)

- `npm run dev` — Start Next.js dev server
- `npm run build` — Build the Next.js app
- `npm run start` — Start the built app
- `npm run preview` — Build + start for preview
- `npm run db:generate` — Runs `prisma migrate dev` (apply migrations + generate client)
- `npm run db:migrate` — `prisma migrate deploy` (apply migrations in deploy environments)
- `npm run db:push` — `prisma db push` (push schema to DB without creating migration files)
- `npm run db:studio` — Open Prisma Studio
- `npm run lint` / `npm run lint:fix` — Linting
- `npm run format:check` / `npm run format:write` — Prettier checks / format

## Quick checklist (copy/paste)

1. Install dependencies:

```powershell
npm install
```

2. Create `.env` with a working `DATABASE_URL` and `AUTH_SECRET` 

3. Start DB (Docker example above) or ensure your MySQL server is running.

4. Run migrations and generate Prisma client:

```powershell
npm run db:generate
```

5. Start dev server:

```powershell
npm run dev
```

6. You might encounter an issue when you npm run dev the first time
it might look like this 
```
> event-manager@0.1.0 dev
> next dev --turbo

❌ Invalid environment variables: [
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'undefined',
    path: [ 'AUTH_DISCORD_ID' ],
    message: 'Required'
  },
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'undefined',
    path: [ 'AUTH_DISCORD_SECRET' ],
    message: 'Required'
  },
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'undefined',
    path: [ 'DATABASE_URL' ],
    message: 'Required'
  }
]
 ⨯ Failed to load next.config.js, see more info here https://nextjs.org/docs/messages/next-config-error
```
what you need to do is just create a .env file in the project root and for now since we dont have a db yet just copy and paste this 
```
# Since the ".env" file is gitignored, you can use the ".env.example" file to
# build a new ".env" file when you clone the repo. Keep this file up-to-date
# when you add new variables to `.env`.

# This file will be committed to version control, so make sure not to have any
# secrets in it. If you are cloning this repo, create a copy of this file named
# ".env" and populate it with your secrets.

# When adding additional environment variables, the schema in "/src/env.js"
# should be updated accordingly.

# Next Auth
# You can generate a new secret on the command line with:
# npx auth secret
# https://next-auth.js.org/configuration/options#secret
AUTH_SECRET="asdad"

# Next Auth Discord Provider
AUTH_DISCORD_ID="sadasd"
AUTH_DISCORD_SECRET="dasdadn"

# Prisma
# https://www.prisma.io/docs/reference/database-reference/connection-urls#env
DATABASE_URL="mysql://root:password@localhost:3306/event-manager"

```
then try npm run dev again