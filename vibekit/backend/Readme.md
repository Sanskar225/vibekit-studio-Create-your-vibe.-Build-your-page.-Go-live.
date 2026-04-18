# ⚙️ VibeKit Studio — Backend

> Node.js REST API built with Netlify Functions + PostgreSQL

---

## 📁 Structure

```
backend/
├── lib/
│   ├── auth/           # JWT sign/verify, bcrypt, cookie helpers
│   ├── db/
│   │   ├── pool.js     # Persistent pg connection pool
│   │   └── slug.js     # Unique slug generator
│   ├── email/          # Nodemailer contact notifications
│   ├── middleware/      # CORS, requireAuth, rateLimit, error handler
│   └── validators/     # Zod schemas for all inputs
│
├── migrations/
│   ├── 001_initial_schema.sql   # Full DB schema
│   └── run.js                   # Migration runner
│
├── netlify/functions/   # Serverless API handlers (production)
│   ├── auth-signup.js
│   ├── auth-login.js
│   ├── auth-logout.js
│   ├── auth-me.js
│   ├── auth-refresh.js
│   ├── pages-index.js
│   ├── pages-id.js
│   ├── pages-publish.js
│   ├── pages-duplicate.js
│   ├── public-page.js
│   ├── public-view.js
│   ├── public-contact.js
│   ├── health.js
│   ├── themes.js
│   └── pages/
│       ├── analytics.js
│       ├── contacts.js
│       └── slug-check.js
│
├── scripts/
│   └── seed.js         # Demo user + pages seed data
│
├── .env.example
├── Dockerfile          # Docker config (local dev)
├── netlify.toml        # Netlify routing (production)
├── package.json
└── server.js           # Local HTTP server (Docker/dev only)
```

---

## 🚀 Setup

### With Docker (Recommended)

```bash
# From vibekit/ root
docker compose up --build
docker compose exec backend node migrations/run.js
docker compose exec backend node scripts/seed.js
```

### Manual

```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET

node migrations/run.js   # Create tables
node scripts/seed.js     # Optional: seed demo data
node server.js           # Start on :8888
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Min 32 chars, used to sign JWTs |
| `NODE_ENV` | ✅ | `development` or `production` |
| `FRONTEND_URL` | ✅ | CORS allowed origin |
| `SMTP_HOST` | ⬜ | Email notifications (optional) |
| `SMTP_PORT` | ⬜ | Usually 587 |
| `SMTP_USER` | ⬜ | SMTP username |
| `SMTP_PASS` | ⬜ | SMTP password |

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns cookies |
| POST | `/api/auth/logout` | Cookie | Clear session |
| GET | `/api/auth/me` | Cookie | Get current user |
| POST | `/api/auth/refresh` | Cookie | Rotate tokens |

### Pages (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages` | List user's pages |
| POST | `/api/pages` | Create new page |
| GET | `/api/pages/:id` | Get single page |
| PUT | `/api/pages/:id` | Update page |
| DELETE | `/api/pages/:id` | Soft delete |
| POST | `/api/pages/:id/publish` | Publish page |
| POST | `/api/pages/:id/unpublish` | Unpublish |
| POST | `/api/pages/:id/duplicate` | Duplicate |
| GET | `/api/pages/:id/analytics` | View stats |
| GET | `/api/pages/:id/contacts` | Submissions |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/pages/:slug` | Get published page |
| POST | `/api/public/pages/:slug/view` | Track view (deduped) |
| POST | `/api/public/pages/:slug/contact` | Contact form submit |

---

## 🗄️ Database Schema

```sql
users               — id, name, email, password_hash, last_login_at
refresh_tokens      — id, user_id, token_hash, expires_at
pages               — id, user_id, title, slug, theme, sections (JSONB), status, view_count
page_views          — id, page_id, visitor_ip, user_agent, referrer, viewed_at
contact_submissions — id, page_id, name, email, message, is_read
slug_history        — id, page_id, old_slug, new_slug (for redirects)
```

---

## 🔐 Auth Strategy

- JWT **access token** (7d) + **refresh token** (30d)
- Both stored in **httpOnly, Secure, SameSite=Strict cookies**
- Refresh tokens stored **hashed** in DB — fully revocable
- Refresh tokens **rotate** on every `/api/auth/refresh` call
- Rate limiting: 5 req/min signup, 10 req/min login

---

## 🐳 Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install dotenv
RUN npm install
COPY . .
EXPOSE 8888
CMD ["node", "server.js"]
```

```bash
# Useful commands
docker compose logs -f backend
docker compose restart backend
docker compose exec backend node migrations/run.js
```

---

## ⚠️ Note

`server.js` is used **only for local Docker development**.
In production (Netlify), functions are routed automatically via `netlify.toml`.