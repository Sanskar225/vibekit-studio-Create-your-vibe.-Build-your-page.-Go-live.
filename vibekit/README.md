# VibeKit Studio

> "Generate a theme, build a mini-site, publish it."
> Full Stack Vibe Coder Intern Assessment — Purple Merit Technologies

---

## Project Structure

```
vibekit/
├── backend/     ← Node.js API (Netlify Functions + PostgreSQL)
└── frontend/    ← React + Vite SPA
```

---

## Quick Start (5 minutes)

### 1. Get a free PostgreSQL database
Sign up at **[neon.tech](https://neon.tech)** → Create project → Copy connection string.

### 2. Install & configure backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET in .env
node migrations/run.js   # Create tables
node scripts/seed.js     # Seed test data (optional)
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Install & run frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

### 4. Run the backend dev server (separate terminal)

```bash
cd backend
npm run dev       # http://localhost:8888  (Netlify CLI)
```

Visit **http://localhost:8888** — the backend serves as the API + proxies frontend.

---

## Test Credentials

```
Email:    demo@vibekit.studio
Password: Demo1234!
```

Or sign up at `/signup` with any email.

---

## Deploying to Netlify

1. Push this repo to GitHub
2. Connect to Netlify → Base directory: `backend`
3. Build command: `cd ../frontend && npm install && npm run build && cp -r dist ../backend/public`
4. Functions directory: `netlify/functions`
5. Publish directory: `public`
6. Set environment variables in **Netlify → Site settings → Environment variables**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-site.netlify.app`

---

## Environment Variables

### Backend (`backend/.env`)
| Variable       | Required | Description |
|----------------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET`   | ✅ | Min 32 chars, used to sign JWTs |
| `NODE_ENV`     | ✅ | `development` or `production` |
| `FRONTEND_URL` | ✅ | CORS allowed origin |
| `SMTP_HOST`    | ⬜ | For email notifications (optional) |
| `SMTP_PORT`    | ⬜ | Usually 587 |
| `SMTP_USER`    | ⬜ | SMTP username |
| `SMTP_PASS`    | ⬜ | SMTP password |

---

## API Endpoints

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/signup`  | — |
| POST | `/api/auth/login`   | — |
| POST | `/api/auth/logout`  | Cookie |
| GET  | `/api/auth/me`      | Cookie |
| POST | `/api/auth/refresh` | Cookie |

### Pages (authenticated)
| Method | Endpoint |
|--------|----------|
| GET    | `/api/pages` |
| POST   | `/api/pages` |
| GET    | `/api/pages/:id` |
| PUT    | `/api/pages/:id` |
| DELETE | `/api/pages/:id` |
| POST   | `/api/pages/:id/publish` |
| POST   | `/api/pages/:id/unpublish` |
| POST   | `/api/pages/:id/duplicate` |
| GET    | `/api/pages/:id/contacts` |
| GET    | `/api/pages/:id/analytics` |
| GET    | `/api/pages/slug-check` |

### Public
| Method | Endpoint |
|--------|----------|
| GET  | `/api/public/pages/:slug` |
| POST | `/api/public/pages/:slug/view` |
| POST | `/api/public/pages/:slug/contact` |

### Utility
| Method | Endpoint |
|--------|----------|
| GET | `/api/health` |
| GET | `/api/themes` |

---

## Auth Strategy

JWTs are stored in **httpOnly, Secure, SameSite=Strict cookies** — not localStorage.
This prevents XSS from stealing tokens. Access token: 7 days. Refresh token: 30 days, stored hashed in DB (revocable). Refresh tokens rotate on every `/api/auth/refresh` call.

---

## Tech Stack

**Frontend:** React 18, Vite, React Router v6, Zustand, TanStack Query, React Hook Form, Framer Motion, Vanta.js, Tailwind CSS

**Backend:** Netlify Functions (Node.js), PostgreSQL, pg pool, JWT, bcrypt, Zod, Nodemailer

---

## Tradeoffs + What I'd Improve Next

1. **In-memory rate limiting** — Works per Lambda instance. Would use Upstash Redis for distributed rate limiting across concurrent invocations in production.

2. **JSONB sections vs. normalised tables** — JSONB is fast and flexible for MVP. At scale I'd normalise `features` and `gallery` into separate tables to enable richer querying and analytics.

3. **No refresh token rotation on every request** — Tokens rotate on explicit `/refresh` calls. Would implement sliding window rotation (rotate on every API call) for higher security with acceptable write overhead.

4. **Email is best-effort** — Contact form persists to DB even if email delivery fails. Would add a `pg-boss` job queue to retry failed emails with exponential backoff.

5. **Image URLs only** — Gallery accepts image URLs, not uploads. Would integrate Cloudinary or Uploadthing for direct image uploads with CDN delivery and automatic optimisation.

---

## Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWTs in httpOnly, Secure, SameSite=Strict cookies
- [x] All inputs validated with Zod server-side
- [x] Parameterised queries — no SQL injection risk
- [x] Ownership checks on every page endpoint (returns 404 to prevent enumeration)
- [x] Publish/unpublish validated server-side
- [x] Rate limiting on auth + public contact endpoints
- [x] No secrets in client-side code
- [x] Consistent error messages to prevent user enumeration
- [x] Stack traces never exposed in API responses
- [x] Soft delete — pages are recoverable
- [x] CORS with explicit allowed origin
- [x] Security headers via Netlify `[[headers]]`
