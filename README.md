# Nuxt + SQLite + Tailwind Starter

A full-stack Nuxt 4 starter template. Clone it, tweak it, ship it. No config headaches—just code.

## What's included

- **Nuxt 4** – Vue 3, file-based routing, server API routes
- **SQLite + Drizzle ORM** – Type-safe schema, migrations, zero config
- **Tailwind CSS** – Utility-first styling
- **Auth** – Email/password signup, encrypted sessions, admin roles

## Quick start

```bash
npm install
cp .env.example .env   # Set NUXT_SESSION_PASSWORD (32+ chars)
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Apply migrations |

## Project structure

```
app/
├── pages/          # Routes (landing, dashboard, login, register)
├── middleware/     # Auth & guest guards
server/
├── api/auth/       # Login, register, logout
├── db/             # Drizzle schema & migrations
└── utils/          # DB instance
```

See [AGENTS.md](./AGENTS.md) for full documentation.
