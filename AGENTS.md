# Jolt Posts - Nuxt 4 Photo App

A full-stack Nuxt 4 application for managing and displaying photo and video posts.

## Project Structure

```
├── app/
│   ├── app.vue              # App entry
│   ├── pages/               # File-based routing
│   │   ├── index.vue        # Public feed/grid view
│   │   └── admin/           # Admin section (auth required)
│   │       ├── index.vue    # Create/delete posts
│   │       └── login.vue    # Admin login
│   ├── components/          # Vue components
│   │   └── PostPhotoCarousel.vue  # Photo/video carousel
│   ├── composables/         # Vue composables (auto-imported)
│   │   └── useTheme.ts      # Dark/light mode toggle
│   └── middleware/          # Route middleware (auth, guest)
├── server/
│   ├── api/
│   │   ├── auth/            # Auth endpoints (login, register, logout)
│   │   ├── admin/           # Admin endpoints (login, upload)
│   │   ├── posts/           # CRUD for posts
│   │   └── uploads/         # Serve uploaded files
│   ├── db/
│   │   ├── schema.ts        # Drizzle schema (users, posts, postPhotos, postVideos tables)
│   │   └── migrations/      # Generated migrations
│   └── utils/
│       └── db.ts            # Database instance
├── scripts/
│   └── init-admin.mjs       # Initialize admin user from NUXT_ADMIN_PASSWORD
├── public/
│   └── uploads/             # Uploaded images and videos (served statically)
├── nuxt.config.ts
├── drizzle.config.ts
├── docker-entrypoint.sh     # Docker startup script (runs migrations + init-admin)
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .env.docker
└── package.json
```

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3 Composition API)
- **Database**: SQLite + Drizzle ORM
- **Styling**: Tailwind CSS with custom gradients
- **Auth**: nuxt-auth-utils (encrypted cookie sessions)
- **File Upload**: Multipart form data → `public/uploads/`

## Quick Start

### Development
```bash
npm install
cp .env.example .env  # Set NUXT_SESSION_PASSWORD and NUXT_ADMIN_PASSWORD
npm run db:migrate    # Only needed once (or after schema changes)
npm run dev           # Runs db:prepare first, then init-admin, then starts dev server
```

### Docker
```bash
cp .env.docker .env   # Or create .env with NUXT_SESSION_PASSWORD and NUXT_ADMIN_PASSWORD
docker-compose up --build
```
App will be available at `http://localhost:7733`

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (runs init-admin first via predev hook) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run db:generate` | Generate migrations from schema changes |
| `npm run db:migrate` | Apply migrations to database |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run init-admin` | Manually re-initialize the admin user |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NUXT_SESSION_PASSWORD` | 32+ char password for session encryption |
| `NUXT_ADMIN_PASSWORD` | Password for admin login at `/admin/login` |

## Database Schema

### Users Table
```ts
users = {
  id: integer (autoIncrement, primaryKey)
  email: text (unique)
  passwordHash: text
  isAdmin: boolean (default: false)
  createdAt: timestamp
}
```

### Posts Table
```ts
posts = {
  id: integer (autoIncrement, primaryKey)
  photoPath: text  # Cover/thumbnail path (photo or video)
  description: text (default: '')
  heartCount: integer (default: 0)
  createdAt: timestamp
}
```

### PostPhotos Table (additional photos for a post)
```ts
postPhotos = {
  id: integer (autoIncrement, primaryKey)
  postId: integer (references posts.id, onDelete: cascade)
  photoPath: text
  orderIndex: integer (default: 0)
}
```

### PostVideos Table (single video per post)
```ts
postVideos = {
  id: integer (autoIncrement, primaryKey)
  postId: integer (references posts.id, onDelete: cascade)
  videoPath: text
}
```

**Note**: A post can have either multiple photos OR a single video, not both.

## Key Patterns

### Session & Auth
**IMPORTANT**: `getUserSession()` returns `{ user }` only. The `loggedIn` property is **always undefined** in this nuxt-auth-utils version.

```ts
// CORRECT - check user and user.isAdmin directly
const { user } = await getUserSession(event)
if (!user?.isAdmin) {
  throw createError({ statusCode: 403, message: 'Forbidden' })
}

// WRONG - loggedIn is undefined
const { loggedIn, user } = await getUserSession(event)
```

### Server Route Naming

Nuxt uses file-based routing for API routes:
- `server/api/posts/index.get.ts` → `GET /api/posts`
- `server/api/posts/index.post.ts` → `POST /api/posts`
- `server/api/posts/[id].put.ts` → `PUT /api/posts/:id`
- `server/api/posts/[id].delete.ts` → `DELETE /api/posts/:id`
- `server/api/admin/upload.post.ts` → `POST /api/admin/upload`

### File Upload (images AND videos)
```ts
const formData = await readMultipartFormData(event)
if (!formData || formData.length === 0) {
  throw createError({ statusCode: 400, message: 'No file uploaded' })
}

// Accept images OR videos
for (const file of formData) {
  if (file.type?.startsWith('image/')) {
    // handle image
  } else if (file.type?.startsWith('video/')) {
    // handle video
  } else {
    throw createError({ statusCode: 400, message: 'Only image or video files are allowed' })
  }
}
```

### Zod Error Handling
Zod errors use `issues` not `errors`:

```ts
// CORRECT
parseResult.error.issues.map((e) => e.message).join(', ')

// WRONG
parseResult.error.errors.map((e) => e.message).join(', ')
```

### Dark/Light Theme
```ts
const { isDark, toggle } = useTheme()

toggle()

<div :class="isDark ? 'bg-black text-white' : 'bg-white text-black'">
```

## API Endpoints

### Public
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET | List all posts with photos or video |

### Admin (requires isAdmin session)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/login` | POST | Login with `NUXT_ADMIN_PASSWORD` |
| `/api/admin/upload` | POST | Upload images or videos, returns `{ photoPaths, videoPaths }` |
| `/api/posts` | POST | Create post with `{ photoPaths }` OR `{ videoPath }`, plus `description` |
| `/api/posts/:id` | PUT | Update post (description, date, photos, or video) |
| `/api/posts/:id` | DELETE | Delete post and all associated media files |

### User Auth
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/logout` | POST | User logout |

## Docker

### Container Architecture
The app runs in two stages:
1. **Build stage**: Compiles Nuxt app and native modules (better-sqlite3)
2. **Production stage**: Runs the built output with production node_modules

### Key Environment Variables
```bash
NITRO_HOST=0.0.0.0   # Bind to all interfaces (required for Docker)
NITRO_PORT=3000      # Container port
NODE_ENV=production  # Enables production mode optimizations
```

### File Serving in Docker
**Important**: Nitro resolves static assets from `server/chunks/public/` at runtime, not from `.output/public/`. This is handled in the Dockerfile with:
```dockerfile
RUN cp -r .output/public .output/server/chunks/public
```

### Persistence (Docker Volumes)
| Volume | Host Path | What Persists |
|--------|-----------|---------------|
| `app-data` | `/app/.data` | SQLite database (`*.db`) |
| `uploads-data` | `/app/public/uploads` | User-uploaded images and videos |

The entrypoint script (`docker-entrypoint.sh`) runs on every container start:
```bash
mkdir -p .data
mkdir -p public/uploads
npx drizzle-kit migrate    # Run migrations
node scripts/init-admin.mjs  # Re-initialize admin user from NUXT_ADMIN_PASSWORD
exec node .output/server/index.mjs
```

### Native Modules
The `better-sqlite3` package requires rebuilding for the Docker architecture:
```dockerfile
RUN npm rebuild better-sqlite3
```

## Coding Conventions

- **Vue**: Composition API with `<script setup lang="ts">`
- **Composables**: Place in `app/composables/` (auto-imported by Nuxt)
- **Server routes**: `server/api/` with naming `[name].[method].ts`
- **State**: Nuxt `useState` for global state, `ref`/`reactive` for local
- **Styling**: Tailwind with custom gradient classes (purple→pink→orange theme)

### Linting & Code Quality

This project uses **@nuxt/eslint** for ESLint integration. Run `npm run lint` before committing.

**Key rules enforced:**
- `no-console`: Use `console.warn`/`console.error` only (no `console.log`)
- `no-debugger`: No `debugger` statements
- `vue/block-order`: Script → Template → Style
- `vue/html-self-closing`: No self-closing non-void HTML elements (`<div/>` forbidden, `<br/>` allowed)
- `vue/attributes-order`: `class` before `@click`/`v-if` etc.
- `@typescript-eslint/no-unused-vars`: Prefix unused args/vars with `_`
- `@typescript-eslint/no-explicit-any`: Avoid `any` - use proper types

**Best practices when coding:**
1. Run `npm run lint:fix` after major changes to auto-fix issues
2. Fix unused imports/variables by prefixing with `_` or removing
3. No `console.log` - use `console.warn` for warnings, `console.error` for errors
4. HTML self-closing tags only for void elements (`<br>`, `<img>`, `<input>`)
5. Put `class` attribute before event handlers (`@click`) and directives (`v-if`)
6. Avoid `any` type - define proper interfaces/types
7. Server route handlers should not have empty blocks

### TypeScript Patterns

**Server route handler:**
```ts
export default defineEventHandler(async (event) => {
  // Your logic here
  return { success: true }
})
```

**Form validation with Zod:**
```ts
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues.map((e) => e.message).join(', ')
    })
  }
  // Use result.data
})
```

## Common Issues

1. **403 Forbidden on upload/posts**: Check session - `loggedIn` may be undefined, use `!user?.isAdmin`
2. **Invalid Date on posts**: `createdAt` is a Date object, not a timestamp - don't multiply by 1000
3. **Zod "Cannot read map of undefined"**: Use `parseResult.error.issues` not `.errors`
4. **Uploads 404**: Files go to `public/uploads/` for static serving
5. **Changes not taking effect**: Run `npm run db:generate && npm run db:migrate` after schema changes
6. **Static assets 404 in Docker**: Nitro looks in `server/chunks/public/` at runtime - ensure Dockerfile copies `.output/public` there
7. **Upload directory missing in Docker**: The entrypoint script creates `public/uploads` and `.data` directories on startup
8. **Admin login wrong password**: Ensure `NUXT_ADMIN_PASSWORD` is set. Run `npm run init-admin` to re-sync the admin user.

## Debugging

### Check session data:
```ts
const { user } = await getUserSession(event)
console.warn('User:', user)
```

### Verify database state:
```ts
import { db } from '~/server/utils/db'
import { posts } from '~/server/db/schema'
const allPosts = await db.select().from(posts)
```

### File upload debugging:
```ts
console.warn('FormData:', formData)
console.warn('File:', formData[0])
console.warn('File type:', formData[0].type)
```

## Agent Targeting

Use `// AGENT:` comments to tag code sections for agentic targeting. This allows agents to quickly locate and understand specific features or areas of the codebase.

### Format
```ts
// AGENT: <feature>-<subfeature>
```

### Current Tags
| Tag | Location | Purpose |
|-----|----------|---------|
| `posts-schema` | `server/db/schema.ts` | Posts table definition |
| `post-photos-schema` | `server/db/schema.ts` | PostPhotos table definition |
| `post-videos-schema` | `server/db/schema.ts` | PostVideos table definition |
| `posts-list` | `server/api/posts/index.get.ts` | GET /api/posts endpoint |
| `posts-create` | `server/api/posts/index.post.ts` | POST /api/posts endpoint |
| `posts-update` | `server/api/posts/[id].put.ts` | PUT /api/posts/:id endpoint |
| `posts-delete` | `server/api/posts/[id].delete.ts` | DELETE /api/posts/:id endpoint |
| `posts-view` | `app/pages/index.vue` | Public posts feed/grid UI |
| `posts-admin` | `app/pages/admin/index.vue` | Admin post management UI |