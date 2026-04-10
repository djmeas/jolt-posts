# Jolt Posts

A full-stack Nuxt 4 photo posting app with a simple UI, multi-photo carousels, and an admin dashboard.

## Why do I need this? Can't I just use --Insert Social Media App Here-- instead?

The idea behind Jolt Posts is simple: Create a social media photo feed that's adminstered by one user. I wanted to share photos
of my family with others but I didn't want to have to upload that media to one of the big social media sites. Control and privacy
are the key reasons behind Jolt Post.

## Features

![1775852535209](image/README/1775852535209.png)

- **Photo Posts** – Create posts with up to 10 photos, drag-to-reorder, and heart reactions
- **Photo Carousel** – Swipe through multi-photo posts
- **Feed & Grid Views** – Toggle between timeline and grid layouts
- **Dark/Light Mode** – Theme toggle with gradient purple→pink→orange styling
- **Site Password** – Optional PIN gate for visitor access
- **Admin Dashboard** – Full post management (create, edit, delete) with drag-and-drop photo reordering
- **Rate Limiting** – Brute-force protection on admin login (5 attempts, 15-min lockout)
- **ESLint** – Code quality enforcement with auto-fix

## Tech Stack

- **Nuxt 4** – Vue 3 Composition API, file-based routing, server API routes
- **SQLite + Drizzle ORM** – Type-safe schema, migrations
- **Tailwind CSS** – Custom gradient theme
- **nuxt-auth-utils** – Encrypted cookie sessions
- **Zod** – Request validation

## Quick Start

```bash
npm install
cp .env.example .env   # Set NUXT_SESSION_PASSWORD and NUXT_ADMIN_PASSWORD
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run db:generate` | Generate migrations from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run test` | Run tests |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NUXT_SESSION_PASSWORD` | 32+ char password for session encryption |
| `NUXT_ADMIN_PASSWORD` | Password for admin login at `/admin/login` |

## Project Structure

```
app/
├── pages/
│   ├── index.vue          # Public feed/grid (posts view)
│   ├── gate.vue           # PIN gate for visitors
│   ├── admin/
│   │   ├── index.vue      # Admin dashboard
│   │   └── login.vue      # Admin login
│   ├── login.vue          # User login
│   ├── register.vue        # User registration
│   └── dashboard.vue       # User dashboard
├── composables/
│   └── useTheme.ts        # Dark/light mode toggle
server/
├── api/
│   ├── auth/              # User auth endpoints
│   ├── admin/             # Admin endpoints (login, upload)
│   ├── posts/             # CRUD for posts
│   └── config/            # Site configuration
├── db/
│   └── schema.ts          # Drizzle schema
└── utils/
    ├── db.ts              # Database instance
    └── rateLimit.ts       # Rate limiting utility
```

## API Endpoints

### Public
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET | List all posts |
| `/api/config` | GET | Get site config |

### Admin (requires isAdmin session)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/login` | POST | Admin login with rate limiting |
| `/api/admin/upload` | POST | Upload images |
| `/api/admin/avatar` | POST | Upload site avatar |
| `/api/posts` | POST | Create post |
| `/api/posts/:id` | PUT | Update post |
| `/api/posts/:id` | DELETE | Delete post |
| `/api/config` | PUT | Update site config |

### User Auth
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/logout` | POST | User logout |

## Docker

```bash
cp .env.docker .env
docker-compose up --build
```

App available at `http://localhost:7733`

See [AGENTS.md](./AGENTS.md) for full documentation.