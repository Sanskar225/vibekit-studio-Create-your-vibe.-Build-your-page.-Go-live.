# 🎨 VibeKit Studio  
**Generate a theme, build a mini-site, publish it.**

 <img width="1901" height="992" alt="Screenshot 2026-04-04 043032" src="https://github.com/user-attachments/assets/7e50a63c-7a10-4120-bc67-0405ff820230" />


---

## 🌐 Live URL  
https://vibe-studio-go.netlify.app  

## 📁 GitHub Repository  
https://github.com/Sanskar225/vibekit-studio-Create-your-vibe.-Build-your-page.-Go-live.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Theme System](#theme-system)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Test Credentials](#test-credentials)
- [Deployment](#deployment)
- [Tradeoffs & Improvements](#tradeoffs--improvements)
- [Responsiveness](#responsiveness)

---

## ✨ Features

### 🚀 Core Functionality
- 🎨 **6 Theme Presets** – Minimal, Neo-Brutal, Dark/Neon, Pastel, Luxury, Retro  
- 📄 **Page Builder** – Hero, Features, Gallery, Contact sections  
- 🔐 **Authentication** – JWT with httpOnly cookies  
- 📊 **Dashboard** – Manage draft/published pages  
- 👁️ **Live Preview** – Desktop/Tablet/Mobile toggle  
- 💾 **Auto-Save** – Real-time save indicator  
- 🔄 **Publish/Unpublish** – One-click publishing  
- 🔗 **Auto Slug Generation** – Unique URLs  
- 📈 **View Tracking** – Stored in DB  
- 📧 **Contact Form** – DB persistence  
- 📋 **Duplicate Pages** – Clone pages  
- 📱 **Responsive Design** – Mobile, tablet, desktop  

### ⚡ Advanced Features
- CSS variables (design tokens)  
- Server-side validation (Zod)  
- User data isolation  
- Skeleton loaders  
- Smooth UI interactions  

---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite  
- Tailwind CSS  
- Zustand  
- React Query  
- React Router v6  

### Backend
- Node.js + Express  
- PostgreSQL (Neon)  
- JWT Authentication  
- bcryptjs  
- Zod  

### DevOps & Deployment
- Docker + Docker Compose  
- PM2 (process management)  
- Nginx (reverse proxy + static serving)  
- AWS (EC2, RDS)  

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────────────────┐
│ Docker Container (Nginx) │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Frontend (React + Vite) - Static Build │ │
│ │ Port: 3000 → Exposed: 80 │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
│
│ Proxy Pass /api
▼
┌─────────────────────────────────────────────────────────────┐
│ Docker Container (Node.js + PM2) │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Backend API (Express) │ │
│ │ PM2 Cluster Mode (auto-scaling) │ │
│ │ Port: 8888 (Internal) │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Docker Container (PostgreSQL) │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ PostgreSQL 15 Alpine │ │
│ │ Port: 5432 (Internal) │ │
│ │ Volume: postgres_data (persistent) │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

text

---

## 📋 Prerequisites

- Node.js >= 18  
- npm >= 9  
- Docker & Docker Compose  

---

## 🚀 Installation (Local)

### 1. Clone Repo
```bash
git clone https://github.com/Sanskar225/vibekit-studio-Create-your-vibe.-Build-your-page.-Go-live.
cd vibekit-studio
2. Backend Setup
bash
cd vibekit/backend
cp .env.example .env
npm install
npm run migrate
node server.js
3. Frontend Setup
bash
cd vibekit/frontend
cp .env.example .env
npm install
npm run dev
🐳 Docker Setup
Docker Compose Configuration
Create docker-compose.yml in project root:

yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: vibekit-db
    environment:
      POSTGRES_USER: vibekit
      POSTGRES_PASSWORD: vibekit_password
      POSTGRES_DB: vibekit_studio
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - vibekit-network
    ports:
      - "5432:5432"

  backend:
    build: ./vibekit/backend
    container_name: vibekit-backend
    environment:
      DATABASE_URL: postgresql://vibekit:vibekit_password@postgres:5432/vibekit_studio
      JWT_SECRET: your-production-secret-key
      NODE_ENV: production
      FRONTEND_URL: http://localhost:3000
    depends_on:
      - postgres
    networks:
      - vibekit-network
    ports:
      - "8888:8888"
    command: sh -c "npm run migrate && pm2-runtime server.js"

  frontend:
    build: ./vibekit/frontend
    container_name: vibekit-frontend
    depends_on:
      - backend
    networks:
      - vibekit-network
    ports:
      - "3000:80"

networks:
  vibekit-network:
    driver: bridge

volumes:
  postgres_data:
Backend Dockerfile (vibekit/backend/Dockerfile)
dockerfile
FROM node:18-alpine

RUN npm install -g pm2

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8888

CMD ["sh", "-c", "npm run migrate && pm2-runtime server.js"]
Frontend Dockerfile (vibekit/frontend/Dockerfile)
dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
Nginx Configuration (vibekit/frontend/nginx.conf)
nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://vibekit-backend:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
PM2 Configuration (vibekit/backend/ecosystem.config.js)
javascript
module.exports = {
  apps: [{
    name: 'vibekit-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
Run Full Stack with Docker
bash
docker-compose up --build
Access
Frontend → http://localhost:3000

Backend → http://localhost:8888

Database → localhost:5432

⚙️ Configuration
Backend .env
env
DATABASE_URL=postgresql://postgres:password@db:5432/vibekit
JWT_SECRET=your-secret-key-minimum-32-characters
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
Frontend .env
env
VITE_API_URL=http://localhost:8888
Production Environment (Netlify)
env
DATABASE_URL=your_neon_db_url
JWT_SECRET=your-production-secret-key
NODE_ENV=production
FRONTEND_URL=https://vibe-studio-go.netlify.app
VITE_API_URL=https://vibe-studio-go.netlify.app
NPM_CONFIG_PRODUCTION=false
▶️ Running the Application
Local Development
bash
# Backend
cd vibekit/backend
node server.js

# Frontend
cd vibekit/frontend
npm run dev
Docker
bash
docker-compose up
Production with PM2 (Without Docker)
bash
cd vibekit/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
📁 Project Structure
text
vibekit-studio/
├── vibekit/
│   ├── backend/
│   │   ├── migrations/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── utils/
│   │   ├── server.js
│   │   ├── ecosystem.config.js
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── package.json
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   ├── api/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── nginx.conf
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── package.json
│   │
│   └── docker-compose.yml
│
└── README.md
📡 API Documentation
Base URL: http://localhost:8888

Authentication Endpoints
Method	Endpoint	Description
POST	/api/auth/signup	Create new user
POST	/api/auth/login	Login user
POST	/api/auth/logout	Logout user
GET	/api/auth/me	Get current user
POST	/api/auth/refresh	Refresh token
Pages Endpoints (Authenticated)
Method	Endpoint	Description
GET	/api/pages	Get all user pages
POST	/api/pages	Create new page
GET	/api/pages/:id	Get page by ID
PUT	/api/pages/:id	Update page
POST	/api/pages/:id/publish	Publish page
POST	/api/pages/:id/unpublish	Unpublish page
POST	/api/pages/:id/duplicate	Duplicate page
Public Endpoints
Method	Endpoint	Description
GET	/api/public/pages/:slug	Get published page
POST	/api/public/pages/:slug/view	Increment view count
POST	/api/public/pages/:slug/contact	Submit contact form
🎨 Theme System
Theme	Style	Color Palette
Minimal	Clean white, sans-serif	Neutrals + blue
Neo-Brutal	Bold borders, chunky buttons	High contrast + yellow
Dark/Neon	Dark bg, glow effects	Black + cyan/pink
Pastel	Soft colors, rounded	Lavender, mint, peach
Luxury	Dark gold, serif fonts	Navy + gold
Retro	Vintage, pixel-inspired	Orange, teal, cream
CSS variables for design tokens

Consistent styling across preview & published pages

🔐 Authentication
JWT (15min access + 7 day refresh token)

httpOnly cookies (XSS protection)

bcrypt hashing (12 rounds)

Protected routes with server-side validation

User data isolation

🗄️ Database Schema
Tables
users

id (UUID, PK)

email (Unique)

password_hash

created_at, updated_at

pages

id (UUID, PK)

user_id (FK)

title

slug (Unique)

theme (enum)

sections (JSON)

is_published

view_count

created_at, updated_at, published_at

contact_submissions

id (UUID, PK)

page_id (FK)

name, email, message

submitted_at

Run Migrations
bash
cd vibekit/backend
npm run migrate
🧪 Test Credentials
Field	Value
Email	demo@vibekit.studio
Password	Demo1234!
Or create a new account via /signup

🚢 Deployment
Netlify Deployment
Connect GitHub repository to Netlify

Build settings:

Build command: cd vibekit/frontend && npm run build

Publish directory: vibekit/frontend/dist

Add environment variables

Deploy!

Docker Production (AWS EC2 / DigitalOcean)
bash
# Pull images
docker pull yourusername/vibekit-backend:latest
docker pull yourusername/vibekit-frontend:latest

# Run containers
docker run -d -p 8888:8888 yourusername/vibekit-backend
docker run -d -p 80:80 yourusername/vibekit-frontend
Push to Docker Hub
bash
docker tag vibekit-backend yourusername/vibekit-backend:latest
docker tag vibekit-frontend yourusername/vibekit-frontend:latest
docker push yourusername/vibekit-backend:latest
docker push yourusername/vibekit-frontend:latest
⚖️ Tradeoffs & Improvements
Current Tradeoffs
Image uploads via URL (no file upload)

No real-time collaboration

Email notifications only in DB

Future Improvements
☁️ Cloudinary/Netlify Blobs for image hosting

🔌 WebSockets for live editing

🎨 12+ themes + custom theme builder

📧 SendGrid/Resend for email delivery

⚡ CDN caching + ISR for faster loads

📱 Responsiveness
Device	Breakpoint	Status
Mobile	320px–480px	✅
Tablet	768px–1024px	✅
Desktop	1280px+	✅
👤 Author
Sanskar Sinha

❤️ Built With
React • Node.js • PostgreSQL • Docker • Nginx • PM2
