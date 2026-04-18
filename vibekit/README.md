# ⚡ VibeKit Studio

<div align="center">

**Generate a theme. Build a mini-site. Publish it.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-vibe--studio--go.netlify.app-7C3AED?style=for-the-badge)](https://vibe-studio-go.netlify.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Sanskar225/vibekit-studio-Create-your-vibe.-Build-your-page.-Go-live.)
[![Netlify](https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://vibe-studio-go.netlify.app)

<br/>

![VibeKit Studio Banner](https://github.com/user-attachments/assets/7e50a63c-7a10-4120-bc67-0405ff820230)

</div>

---

## 🎯 What is VibeKit Studio?

VibeKit Studio is a **full-stack themed page builder** where users can:

1. 🎨 **Pick a vibe** — choose from 6 stunning design presets
2. 🛠️ **Build a page** — edit sections with a live preview editor
3. 🚀 **Publish instantly** — get a public URL in one click

> Built for the **Purple Merit Technologies Full Stack Vibe Coder Internship Assessment**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **6 Theme Presets** | Minimal, Neo-Brutal, Dark/Neon, Pastel, Luxury, Retro — each with full CSS design tokens |
| 🛠️ **Live Page Builder** | Edit Hero, Features, Gallery & Contact sections with real-time preview |
| 📱 **Responsive Preview** | Toggle Desktop / Tablet / Mobile viewport in the editor |
| 🌐 **Instant Publish** | One-click publish with auto-generated unique slug |
| 💾 **Auto-Save** | Changes save automatically while you type |
| 📊 **Analytics** | View counts, unique visitors, referrer breakdown — all in PostgreSQL |
| 🔐 **JWT Auth** | Secure login with httpOnly cookies, bcrypt passwords, refresh token rotation |
| 🐳 **Docker Support** | Full local development environment with Docker Compose |

---

## 🚀 Quick Start

### Option 1 — Docker (Recommended, Zero Setup)

```bash
# 1. Clone the repo
git clone https://github.com/Sanskar225/vibekit-studio-Create-your-vibe.-Build-your-page.-Go-live.
cd vibekit-studio

# 2. Start everything
cd vibekit
docker compose up --build

# 3. Setup database (first time only)
docker compose exec backend node migrations/run.js
docker compose exec backend node scripts/seed.js

# 4. Open browser
# http://localhost:3000
```

### Option 2 — Manual Setup

```bash
# Backend
cd vibekit/backend
cp .env.example .env   # fill in your values
npm install
node migrations/run.js
node server.js         # runs on :8888

# Frontend (new terminal)
cd vibekit/frontend
cp .env.example .env
npm install
npm run dev            # runs on :3000
```

---

## 🔑 Test Credentials

```
Email:    demo@vibekit.studio
Password: Demo1234!
```

Or sign up at `/signup` with any email.

---

## 🏗️ Project Structure

```
vibekit-studio/
├── vibekit/
│   ├── backend/                  # Node.js API (Netlify Functions + PostgreSQL)
│   │   ├── lib/
│   │   │   ├── auth/             # JWT, bcrypt helpers
│   │   │   ├── db/               # pg pool, slug generator
│   │   │   ├── email/            # Nodemailer
│   │   │   ├── middleware/       # CORS, auth, rate limiting
│   │   │   └── validators/       # Zod schemas
│   │   ├── migrations/           # SQL schema migrations
│   │   ├── netlify/functions/    # Serverless API handlers
│   │   ├── scripts/              # Seed data
│   │   ├── Dockerfile            # Docker config
│   │   └── server.js             # Local dev server
│   │
│   ├── frontend/                 # React + Vite SPA
│   │   ├── src/
│   │   │   ├── components/       # PageRenderer, Editor
│   │   │   ├── pages/            # Landing, Login, Dashboard, Editor, Published
│   │   │   ├── store/            # Zustand auth store
│   │   │   ├── lib/              # Axios API client
│   │   │   └── styles/           # Global CSS design tokens
│   │   └── Dockerfile            # Docker config
│   │
│   └── docker-compose.yml        # Local dev orchestration
│
└── netlify.toml                  # Production routing config
```

---

## 🎨 Theme System

6 vibe presets, each with complete CSS design tokens:

| Theme | Style | Accent |
|-------|-------|--------|
| **Minimal** | Clean editorial, serif headings | `#1A1A1A` |
| **Neo-Brutal** | Bold borders, high contrast | `#FF3B00` |
| **Dark/Neon** | Dark bg, glowing accents | `#00FF88` |
| **Pastel/Soft** | Rounded, playful, warm | `#E8756A` |
| **Luxury/Serif** | Dark gold, elegant spacing | `#C9A96E` |
| **Retro/Pixel** | Pixel-inspired, nostalgic | `#F7C948` |

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-orange?style=flat-square)
![React Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=flat-square&logo=framer)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON%20web%20tokens)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square)
![Netlify Functions](https://img.shields.io/badge/Netlify_Functions-00C7B7?style=flat-square&logo=netlify)

### DevOps
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)

---

## 🐳 Docker Commands

```bash
docker compose up --build          # Build and start all containers
docker compose up                  # Start (after first build)
docker compose down                # Stop all containers
docker compose restart backend     # Restart only backend
docker compose logs -f backend     # Watch backend logs
docker compose exec backend node migrations/run.js   # Run DB migrations
docker compose exec backend node scripts/seed.js     # Seed test data
```

---

## 🔐 Security

- ✅ Passwords hashed with **bcrypt** (12 rounds)
- ✅ JWTs stored in **httpOnly, Secure, SameSite=Strict cookies**
- ✅ All inputs validated with **Zod** server-side
- ✅ **Parameterised queries** — no SQL injection risk
- ✅ Ownership checks on every page endpoint
- ✅ **Rate limiting** on auth + public contact endpoints
- ✅ No secrets in client-side code
- ✅ Security headers via Netlify `[[headers]]`

---

## 📡 API Endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/pages
POST   /api/pages
GET    /api/pages/:id
PUT    /api/pages/:id
DELETE /api/pages/:id
POST   /api/pages/:id/publish
POST   /api/pages/:id/unpublish
POST   /api/pages/:id/duplicate

GET    /api/public/pages/:slug
POST   /api/public/pages/:slug/view
POST   /api/public/pages/:slug/contact
```

---

## 📱 Responsiveness

Tested and verified at:
- Mobile: 320px–480px ✅
- Tablet: 768px–1024px ✅
- Desktop: 1280px+ ✅

---

## ⚙️ Environment Variables

### Backend (`vibekit/backend/.env`)
```env
DATABASE_URL=postgresql://user:password@host:5432/vibekit
JWT_SECRET=your-64-char-secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (`vibekit/frontend/.env`)
```env
VITE_API_URL=http://localhost:8888
```

---

<div align="center">

**Built with ❤️ by Sanskar Sinha**

[![Portfolio](https://img.shields.io/badge/GitHub-Sanskar225-black?style=flat-square&logo=github)](https://github.com/Sanskar225)

</div>