# SQLFLOW — Natural Language to SQL

> **AI-Powered SQL Workspace** • From plain English to powerful, dialect-optimized SQL in seconds.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwind-css)

SQLFLOW is an enterprise-grade web application that converts natural language instructions into syntactically precise, dialect-compliant SQL queries. Designed with a dark developer aesthetic inspired by modern data platforms like HydraDB, SQLFLOW pairs intuitive intent parsing with built-in query safety guardrails.

---

## ✨ Features

- **Multi-Dialect Synthesis:** Generates native syntax for **PostgreSQL 16**, **MySQL 8.0+**, **SQLite 3**, **Microsoft SQL Server (T-SQL)**, and **Oracle Database**.
- **Interactive Schema Context:** Inject custom database schemas or select pre-built templates (*University & Students*, *E-Commerce*, *Company HR*) to ground queries in real tables and columns.
- **Safety Guardrails:** Automatically flags destructive operations (`DELETE`, `UPDATE`, `DROP`, `TRUNCATE`) with prominent warning banners.
- **Explainable SQL:** Detailed query breakdown explaining *"What this query does"*, *"Assumptions made"*, and *"Potential risks & performance notes"*.
- **Developer Code Studio:**
  - Syntax highlighting with line numbers and token coloring
  - Live editable code mode
  - One-click copy and `.sql` file download
  - SQL Prettifier / Formatter via `sql-formatter`
- **Fluid Cursor Trail:** Hardware-accelerated `#0047AB` glowing cursor trail with particle physics (respects `prefers-reduced-motion` and touch devices).
- **Persistent Query History:** Browser-local storage drawer to view, copy, and restore previous query generations.
- **Hybrid AI Engine:** Native support for Google Gemini 2.5 and OpenAI GPT-4o, paired with an intelligent offline heuristic engine for zero-config demonstration.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Icons:** [Lucide React](https://lucide.dev/)
- **Formatting:** `sql-formatter`
- **AI Integration:** Google Gemini API (`@google/genai` REST) & OpenAI API

---

## 🚀 Quickstart (Local Development)

### Prerequisites

- Node.js `20.x` or newer (Node 24 supported)
- npm, pnpm, or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sqlflow.git
cd sqlflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables (Optional)

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your API keys:

```env
# Google Gemini API Key (Recommended)
# Get a key from https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key

# OpenAI API Key (Alternative)
# Get a key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key
```

> **Note:** If no API keys are provided, SQLFLOW automatically functions in **Smart Heuristic Engine Mode**, which intelligently handles dialect translations, missing value handling, joins, and aggregations offline.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Hosting & Deployment Guide

You can deploy SQLFLOW to any modern cloud platform. Here are the most popular deployment methods:

### Option 1: Deploy on Vercel (Recommended & Easiest)

Vercel is the creator of Next.js and provides zero-configuration deployment:

1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your SQLFLOW repository.
4. In the **Environment Variables** section, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
   - `OPENAI_API_KEY`: *(Optional OpenAI key)*
5. Click **Deploy**. Vercel will automatically build and assign a global SSL domain.

---

### Option 2: Deploy with Docker

SQLFLOW includes a production-ready, multi-stage [`Dockerfile`](./Dockerfile).

#### 1. Build the Docker Image:

```bash
docker build -t sqlflow:latest .
```

#### 2. Run the Container:

```bash
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your_api_key_here" \
  --name sqlflow-app \
  sqlflow:latest
```

Your app will be accessible at `http://localhost:3000`.

#### Docker Compose:

If you use `docker-compose`, create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  sqlflow:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: always
```

Run with:
```bash
docker compose up -d
```

---

### Option 3: Deploy on a Linux VPS (Ubuntu / Debian / EC2 / DigitalOcean)

To host on a standard Linux server using **Node.js**, **PM2**, and **Nginx**:

#### 1. Install Node.js 20+ & PM2:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

#### 2. Clone and build the application:

```bash
git clone https://github.com/your-username/sqlflow.git /var/www/sqlflow
cd /var/www/sqlflow
npm ci
npm run build
```

#### 3. Start with PM2:

```bash
pm2 start npm --name "sqlflow" -- start
pm2 save
pm2 startup
```

#### 4. Configure Nginx Reverse Proxy:

Create `/etc/nginx/sites-available/sqlflow`:

```nginx
server {
    listen 80;
    server_name sqlflow.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/sqlflow /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

Obtain a free SSL certificate with Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d sqlflow.yourdomain.com
```

---

### Option 4: Deploy on Railway / Render / Fly.io

#### Railway:
1. Connect your GitHub repository to [Railway](https://railway.app/).
2. Add your environment variables (`GEMINI_API_KEY`).
3. Railway automatically detects Next.js and deploys it.

#### Render:
1. Create a new **Web Service** on [Render](https://render.com/).
2. Select your repository.
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Add Environment Variables under the service settings.

---

## 🔒 Security Principles

- **No Automatic Query Execution:** Generated SQL is designed for manual inspection and safe copying. It is **never** executed against user databases.
- **Credential Protection:** Database credentials and LLM API keys are handled server-side and never exposed to the client or browser bundle.
- **Client Privacy:** Query history is stored locally in the user's browser `localStorage` and is never transmitted to external analytics or telemetry services.

---

## 📁 Project Structure

```
sqlflow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts          # Server-side AI generation endpoint
│   │   ├── globals.css               # HydraDB theme, CSS variables & utility classes
│   │   ├── layout.tsx                # Metadata and root layout
│   │   └── page.tsx                  # Main single-page application orchestrator
│   ├── components/
│   │   ├── CursorTrail.tsx           # Glowing particle cursor animation
│   │   ├── DocumentationModal.tsx    # Dialect cheatsheet and guidelines
│   │   ├── ExamplesSection.tsx       # Interactive prompt cards
│   │   ├── FeaturesSection.tsx       # Capabilities showcase cards
│   │   ├── Footer.tsx                # Brand footer & navigation
│   │   ├── GeneratorWorkspace.tsx    # Core 2-panel NL-to-SQL studio
│   │   ├── HeroSection.tsx           # Hero with live application preview
│   │   ├── HistoryDrawer.tsx         # Saved queries manager
│   │   ├── HowItWorksSection.tsx     # 3-step timeline
│   │   ├── Navbar.tsx                # Navigation bar with engine indicator
│   │   ├── SettingsModal.tsx         # User API key and provider switcher
│   │   └── SqlCodeViewer.tsx         # Code editor with syntax highlighting
│   ├── lib/
│   │   ├── constants.ts              # Dialects, schemas, and example prompts
│   │   └── sqlEngine.ts              # Heuristic synthesis & safety detection engine
│   └── types/
│       └── sqlflow.ts                # TypeScript interfaces
├── Dockerfile                        # Multi-stage production container
├── .dockerignore                     # Docker build exclusions
├── .env.example                      # Template environment variables
├── package.json
└── README.md
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
