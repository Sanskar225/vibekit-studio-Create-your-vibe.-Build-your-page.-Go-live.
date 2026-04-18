# 🎨 VibeKit Studio — Frontend

> React 18 + Vite SPA with live page builder, 6 theme presets, and instant publish

---

## 📁 Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── editor/
│   │       └── PageRenderer.jsx   # Renders any page with any theme
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx        # Marketing page with Vanta.js animation
│   │   ├── LoginPage.jsx          # Auth with Vanta WAVES background
│   │   ├── SignupPage.jsx         # Registration with password strength meter
│   │   ├── DashboardPage.jsx      # Page list, create modal, filters
│   │   ├── EditorPage.jsx         # Full page builder with live preview
│   │   └── PublishedPage.jsx      # Public page renderer
│   │
│   ├── store/
│   │   └── auth.js                # Zustand auth store with persistence
│   │
│   ├── lib/
│   │   └── api.js                 # Axios client with auto token refresh
│   │
│   └── styles/
│       └── globals.css            # Design tokens, components, animations
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile                     # Docker config (local dev)
└── package.json
```

---

## 🚀 Setup

### With Docker (Recommended)

```bash
# From vibekit/ root — frontend starts automatically
docker compose up --build
# Open: http://localhost:3000
```

### Manual

```bash
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8888

npm run dev      # Dev server on :3000
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

---

## 🔑 Environment Variables

```env
VITE_API_URL=http://localhost:8888
```

---

## 🎨 Theme System

Each theme exports a full set of CSS design tokens applied via inline styles:

```javascript
{
  bg, surface, text, muted, accent, border,   // Colors
  fh, fb,                                      // Font families (heading, body)
  hs, fw, lh, ls,                              // Typography
  r, rc, rb,                                   // Border radius (base, card, button)
  bbg, bc, bb,                                 // Button (bg, color, border)
  sh, sBtn,                                    // Shadows
  sp                                           // Section padding
}
```

| Theme ID | Name | Accent |
|----------|------|--------|
| `minimal` | Minimal / Editorial | `#1A1A1A` |
| `neo-brutal` | Neo-Brutal | `#FF3B00` |
| `dark-neon` | Dark / Neon | `#00FF88` |
| `pastel-soft` | Pastel / Soft | `#E8756A` |
| `luxury-serif` | Luxury / Serif | `#C9A96E` |
| `retro-pixel` | Retro / Pixel | `#F7C948` |

---

## 📦 Dependencies

### Core
| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `react-router-dom` v6 | Client-side routing |
| `@tanstack/react-query` | Server state management |
| `zustand` | Client state (auth) |
| `axios` | HTTP client with interceptors |

### UI / Animation
| Package | Purpose |
|---------|---------|
| `framer-motion` | Page animations |
| `lucide-react` | Icon library |
| `react-hot-toast` | Toast notifications |
| `tailwindcss` | Utility CSS |

### Forms
| Package | Purpose |
|---------|---------|
| `react-hook-form` | Form state + validation |
| `zod` | Schema validation |

### 3D / Visual
| Package | Purpose |
|---------|---------|
| `vanta.js` | Animated hero backgrounds |
| `three.js` | Vanta.js peer dependency |

---

## 🖥️ Pages

### Landing Page (`/`)
- Vanta NET animated background
- Theme preview cards carousel
- Features grid with icons
- CTA section with gradient

### Login / Signup (`/login`, `/signup`)
- Vanta WAVES background
- React Hook Form with Zod validation
- Password strength indicator
- JWT stored in httpOnly cookies

### Dashboard (`/app`)
- Page list with status badges
- Create modal with theme picker
- Filter by draft / published
- Duplicate, delete with confirmation

### Editor (`/app/pages/:id`)
- 3-tab sidebar: Content / Theme / Settings
- Section editors: Hero, Features, Gallery, Contact
- Viewport toggle: Desktop / Tablet / Mobile
- Auto-save with debounce (2s)
- Publish / Unpublish toggle

### Published Page (`/p/:slug`)
- Full page render with theme
- View tracking (30-min IP dedup)
- Contact form with DB persistence
- 404 for unpublished/deleted pages

---

## 🎭 Component: PageRenderer

The core rendering engine used in both editor preview and public pages:

```jsx
<PageRenderer
  theme="dark-neon"        // Theme ID
  sections={sections}      // Array of section objects
  title="My Page"          // Page title
  slug="my-page"           // URL slug
  isPreview={false}        // true = contact form not stored
  viewCount={42}           // Shown in footer
/>
```

---

## 🔄 API Client

Auto token refresh on 401:

```javascript
api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      // Auto refresh token and retry
    }
  }
)
```

---

## 🐳 Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

---

## 📱 Responsive Breakpoints

```
Mobile:  320px – 480px   ✅
Tablet:  768px – 1024px  ✅
Desktop: 1280px+          ✅
```