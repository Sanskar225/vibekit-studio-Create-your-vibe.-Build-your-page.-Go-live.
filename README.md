<img width="1901" height="992" alt="image" src="https://github.com/user-attachments/assets/15c897f5-00fc-411c-9598-8684fb916f1a" /># VibeKit Studio
> Generate a theme, build a mini-site, publish it.
> <img width="1901" height="992" alt="Screenshot 2026-04-04 043032" src="https://github.com/user-attachments/assets/7e50a63c-7a10-4120-bc67-0405ff820230" />


## 🌐 Live URL
**https://vibe-studio-go.netlify.app**

## 📁 GitHub Repository
**https://github.com/Sanskar225/vibekit-studio-Create-your-vibe.-Build-your-page.-Go-live.**

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database (Neon recommended)

### 1. Clone the repo
```bash
git clone https://github.com/Sanskar225/vibekit-studio-Create-your-vibe.-Build-your-page.-Go-live.
cd vibekit-studio
```

### 2. Backend Setup
```bash
cd vibekit/backend
cp .env.example .env
# Fill in your .env values (see below)
npm install
npm run migrate
node server.js
```

### 3. Frontend Setup
```bash
cd vibekit/frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:8888
npm install
npm run dev
```

---

## 🔑 Environment Variables Required

### Backend (`vibekit/backend/.env`)
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-long-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (`vibekit/frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

### Netlify Environment Variables (Production)
```
DATABASE_URL
JWT_SECRET
NODE_ENV=production
FRONTEND_URL=https://vibe-studio-go.netlify.app
VITE_API_URL=https://vibe-studio-go.netlify.app
NPM_CONFIG_PRODUCTION=false
```

---

## 🧪 Test User Credentials
```
Email:    demo@vibekit.studio
Password: Demo1234!
```
Or feel free to create a new account via `/signup`.

---

## 🏗️ Architecture Overview

### Frontend
- **React 18** + Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching
- **React Router v6** for routing

### Backend
- **Netlify Functions** (serverless API)
- **PostgreSQL** via Neon (serverless Postgres)
- **JWT** authentication (httpOnly cookies)
- **bcryptjs** for password hashing
- **zod** for input validation

### Database
- PostgreSQL hosted on **Neon**
- Clean schema with migrations (`npm run migrate`)
- Tables: `users`, `pages`, `contact_submissions`

---

## 🎨 Theme System

6 vibe presets, each defining color palette, typography, spacing, and button style:

| Theme | Style |
|-------|-------|
| **Minimal** | Clean white, sans-serif, subtle borders |
| **Neo-Brutal** | Bold borders, high contrast, chunky buttons |
| **Dark/Neon** | Dark bg, neon accents, glow effects |
| **Pastel** | Soft colors, rounded corners, playful |
| **Luxury** | Dark gold, serif fonts, elegant spacing |
| **Retro** | Vintage palette, pixel-inspired, nostalgic |

All themes use **CSS variables (design tokens)** applied consistently. Published page renders identically to preview.

---

## 🔐 Auth & Sessions

- Email + password signup with bcrypt hashing (12 rounds)
- JWT access token (15min) + refresh token (7 days)
- Stored in **httpOnly cookies** for XSS protection
- Server-side validation on all authenticated routes
- Users can only access their own pages

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh
```

### Pages (authenticated)
```
GET    /api/pages
POST   /api/pages
GET    /api/pages/:id
PUT    /api/pages/:id
POST   /api/pages/:id/publish
POST   /api/pages/:id/unpublish
POST   /api/pages/:id/duplicate
```

### Public
```
GET  /api/public/pages/:slug
POST /api/public/pages/:slug/view
POST /api/public/pages/:slug/contact
```

---

## ✅ Features Implemented

- [x] Marketing landing page with 3 theme showcases
- [x] Email + password auth with JWT httpOnly cookies
- [x] Dashboard with page list (draft/published status)
- [x] Page builder with 4 sections (Hero, Features, Gallery, Contact)
- [x] Live preview with Desktop/Tablet/Mobile toggle
- [x] 6 theme presets with CSS variables
- [x] Auto-save with "Saved" state indicator
- [x] Publish/Unpublish toggle
- [x] Auto-generated unique slugs
- [x] Public page at `/p/:slug`
- [x] View count tracking in DB
- [x] Contact form with DB persistence
- [x] Duplicate page functionality
- [x] Responsive design (mobile/tablet/desktop)
- [x] Micro-interactions and hover states
- [x] Skeleton loaders
- [x] PostgreSQL with migrations
- [x] Netlify Functions serverless backend
- [x] No secrets in client-side code

---

## ⚖️ Tradeoffs + What I'd Improve Next

1. **Image uploads** — Currently using image URLs instead of file uploads. Would add Cloudinary or Netlify Blobs for proper image hosting.

2. **Real-time collaboration** — Would add WebSocket support for live multi-user editing using Netlify's real-time features.

3. **More themes** — Would expand to 12+ themes with a custom theme builder where users can tweak individual tokens.

4. **Email notifications** — Contact form submissions currently only saved to DB. Would integrate SendGrid/Resend for actual email delivery.

5. **Performance** — Would add CDN caching for published pages and implement ISR (Incremental Static Regeneration) pattern for faster public page loads.

---

## 📱 Responsiveness

Tested and verified at:
- Mobile: 320px–480px ✅
- Tablet: 768px–1024px ✅  
- Desktop: 1280px+ ✅

---

*Built with ❤️ by Sanskar Sinha*
