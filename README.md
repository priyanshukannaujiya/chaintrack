<div align="center">

<img src="https://img.shields.io/badge/ChainTrack-Supply%20Chain%20SaaS-4F6EF7?style=for-the-badge&logo=zap&logoColor=white" alt="ChainTrack" />

<h1>⚡ ChainTrack</h1>

<p><strong>Real-time supply chain visibility for modern businesses.</strong><br/>
Track every product, every shipment, every event — verified on-chain.</p>

<p>
  <a href="https://chaintrack-tylx.onrender.com/health"><img src="https://img.shields.io/badge/API-Live-00D4AA?style=flat-square&logo=render&logoColor=white" alt="API Status" /></a>
  <img src="https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel" alt="Frontend" />
  <img src="https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E5CC?style=flat-square&logo=postgresql&logoColor=white" alt="Database" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="Backend" />
  <img src="https://img.shields.io/badge/Blockchain-Ethereum%20Sepolia-627EEA?style=flat-square&logo=ethereum&logoColor=white" alt="Blockchain" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

<p>
  <a href="#-demo">Demo</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-api-reference">API Reference</a> ·
  <a href="#-deployment">Deployment</a>
</p>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-demo)
- [Features](#-features)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌐 Overview

**ChainTrack** is a multi-tenant SaaS platform that gives businesses end-to-end visibility into their supply chains. It combines a modern React dashboard with a FastAPI backend, Neon PostgreSQL database, and optional Ethereum blockchain event verification on the Sepolia testnet.

> Built for manufacturers, distributors, warehouse operators, and retailers who need to track product journeys from origin to delivery — with an immutable audit trail.

**Key capabilities:**
- 🏢 **Multi-company** — each company's data is fully isolated by `company_id`
- 📦 **Product management** — register, track, and bulk-import products via CSV
- 🚚 **Shipment tracking** — initiate transfers between companies with real-time status
- ⛓️ **Blockchain events** — register critical events on Ethereum Sepolia for immutability
- 🔐 **Role-based access** — ADMIN · MANUFACTURER · WAREHOUSE · DISTRIBUTOR · RETAILER

---

## 🎯 Demo

| Surface | URL | Status |
|---------|-----|--------|
| 🌐 Frontend (Live App) | [https://chaintrack-rose.vercel.app](https://chaintrack-rose.vercel.app/) | ![Vercel](https://img.shields.io/badge/Vercel-Live-000000?style=flat-square&logo=vercel) |
| 🔌 Backend API | [https://chaintrack-tylx.onrender.com](https://chaintrack-tylx.onrender.com) | ![Render](https://img.shields.io/badge/Render-Live-46E3B7?style=flat-square&logo=render&logoColor=white) |
| 📖 Interactive API Docs (Swagger) | [https://chaintrack-tylx.onrender.com/docs](https://chaintrack-tylx.onrender.com/docs) | ![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=flat-square&logo=swagger&logoColor=black) |
| ❤️ Service Health Check | [https://chaintrack-tylx.onrender.com/health](https://chaintrack-tylx.onrender.com/health) | ![Health](https://img.shields.io/badge/Health-200%20OK-brightgreen?style=flat-square) |

> **Note:** Render free tier sleeps after 15 min of inactivity. First request may take ~30s.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Auth** | Secure signup/login with bcrypt-hashed passwords and 7-day tokens |
| 🏢 **Multi-tenancy** | Complete data isolation per company at the database level |
| 📦 **Product Catalog** | Create, list, and manage products with status lifecycle tracking |
| 📄 **CSV Import** | Bulk-import products with per-row error reporting |
| 🚚 **Shipment Management** | Create and track shipments between partner companies |
| 📡 **Live Tracking** | Real-time carrier API integration with estimated delivery |
| ⛓️ **Blockchain Events** | Ethereum Sepolia event registration with MetaMask signing |
| 📊 **Analytics Dashboard** | Area charts, bar charts, and KPI stat cards |
| 🌙 **Dark Mode UI** | Premium glassmorphism design with animated components |
| 🔄 **Alembic Migrations** | Version-controlled database schema management |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │         React + TypeScript (Vite)  — Vercel CDN         │   │
│   │                                                         │   │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │   │
│   │   │  Auth    │  │Dashboard │  │Products/Shipments│    │   │
│   │   │  Pages   │  │Overview  │  │     Pages        │    │   │
│   │   └────┬─────┘  └────┬─────┘  └────────┬─────────┘    │   │
│   │        │             │                  │               │   │
│   │   ┌────▼─────────────▼──────────────────▼───────────┐  │   │
│   │   │     TanStack React Query + Axios (api.ts)        │  │   │
│   │   └───────────────────────┬─────────────────────────┘  │   │
│   └───────────────────────────┼─────────────────────────────┘   │
│                               │ HTTPS + JWT Bearer Token         │
└───────────────────────────────┼─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                         API LAYER                               │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │            FastAPI  — Render Web Service                │   │
│   │                                                         │   │
│   │  /api/v1/auth      /api/v1/products   /api/v1/users    │   │
│   │  /api/v1/shipments /api/v1/blockchain /api/v1/companies │   │
│   │                                                         │   │
│   │   ┌──────────────────────────────────────────────────┐  │   │
│   │   │              Service Layer                        │  │   │
│   │   │  AuthService · ProductService · ShipmentService  │  │   │
│   │   │  BlockchainService · LogisticsService            │  │   │
│   │   └───────────────┬──────────────────────────────────┘  │   │
│   └───────────────────┼─────────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────────┘
                        │
          ┌─────────────┴──────────────────┐
          │                                │
┌─────────▼──────────┐          ┌──────────▼─────────┐
│   DATA LAYER       │          │  BLOCKCHAIN LAYER   │
│                    │          │                     │
│  Neon PostgreSQL   │          │  Ethereum Sepolia   │
│  (Serverless PG)   │          │  (Solidity events)  │
│                    │          │                     │
│  ┌──────────────┐  │          │  ┌───────────────┐  │
│  │  companies   │  │          │  │  MetaMask     │  │
│  │  users       │  │          │  │  signing      │  │
│  │  products    │  │          │  │               │  │
│  │  shipments   │  │          │  │  Ethers.js    │  │
│  │  partners    │  │          │  │  bridge       │  │
│  │  blockchain_ │  │          │  └───────────────┘  │
│  │  events      │  │          └────────────────────┘
│  └──────────────┘  │
└────────────────────┘
```

### Request Flow

```
Browser
  │
  ├─ GET /dashboard
  │     └─ React Query → axios.get("/api/v1/products")
  │                          └─ FastAPI route handler
  │                               └─ Depends(get_current_user)  ← JWT validation
  │                                    └─ ProductService.list()
  │                                         └─ SQLAlchemy query (filtered by company_id)
  │                                              └─ Neon PostgreSQL
  │                                                   └─ JSON response ←─────────────┘
  │
  └─ POST /blockchain/register
        └─ React → Ethers.js → MetaMask signs tx → Sepolia testnet
                                    └─ tx_hash → FastAPI → BlockchainEvent stored in PG
```

### Authentication Flow

```
POST /api/v1/auth/signup
  │
  ├─ Validate email + password (Pydantic)
  ├─ Check email uniqueness
  ├─ Create Company record
  ├─ Hash password (bcrypt)
  ├─ Create User record with company_id
  └─ Return JWT token (HS256, 7-day expiry)

POST /api/v1/auth/login
  │
  ├─ Lookup user by email
  ├─ Verify password hash (passlib)
  └─ Return JWT token

Protected Routes
  │
  └─ Authorization: Bearer <token>
       └─ get_current_user() → decode JWT → fetch User → inject into handler
```

---

## 🗄️ Database Schema

```
┌──────────────────────────────────────────────────────────────────┐
│                         companies                                │
│  id (UUID PK) · name (VARCHAR) · created_at · updated_at        │
└──────────────────────────────┬───────────────────────────────────┘
                               │ 1:N
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼──────┐    ┌──────────▼──────┐    ┌─────────▼─────────┐
│    users     │    │    products     │    │     partners       │
│              │    │                 │    │                    │
│ id (UUID PK) │    │ id (UUID PK)    │    │ id (UUID PK)       │
│ company_id → │    │ company_id →    │    │ company_id →       │
│ email        │    │ name            │    │ partner_company_id │
│ hashed_pass  │    │ description     │    │ relationship_type  │
│ role (ENUM)  │    │ quantity        │    │  SUPPLIER          │
│              │    │ status (ENUM)   │    │  DISTRIBUTOR       │
│ ROLES:       │    │  DRAFT          │    │  BUYER             │
│  ADMIN       │    │  REGISTERED     │    └────────────────────┘
│  MANUF.      │    │  IN_TRANSIT     │
│  WAREHOUSE   │    │  DELIVERED      │
│  DISTRIB.    │    │ blockchain_hash │
│  RETAILER    │    └────────┬────────┘
└──────────────┘             │ 1:N
                    ┌────────┴───────────────────┐
                    │                            │
         ┌──────────▼──────────┐    ┌────────────▼──────────┐
         │      shipments      │    │   blockchain_events   │
         │                     │    │                       │
         │ id (UUID PK)        │    │ id (UUID PK)          │
         │ company_id →        │    │ company_id →          │
         │ product_id →        │    │ product_id →          │
         │ from_company_id →   │    │ transaction_hash      │
         │ to_company_id →     │    │ event_type            │
         │ status (ENUM)       │    │ status (ENUM)         │
         │  PENDING            │    │  PENDING              │
         │  SHIPPED            │    │  CONFIRMED            │
         │  RECEIVED           │    │  FAILED               │
         │  CANCELLED          │    │  SYNC_REQUIRED        │
         └─────────────────────┘    └───────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev) | 19 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 6 | Type safety |
| [Vite](https://vitejs.dev) | 8 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state management |
| [React Router](https://reactrouter.com) | 7 | Client-side routing |
| [Axios](https://axios-http.com) | 1.x | HTTP client |
| [Recharts](https://recharts.org) | 3 | Charts & analytics |
| [Lucide React](https://lucide.dev) | 1.x | Icon system |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Python](https://python.org) | 3.11+ | Runtime |
| [FastAPI](https://fastapi.tiangolo.com) | Latest | API framework |
| [SQLAlchemy](https://sqlalchemy.org) | 2.0 | ORM |
| [Alembic](https://alembic.sqlalchemy.org) | Latest | Database migrations |
| [Pydantic](https://docs.pydantic.dev) | 2.x | Data validation |
| [PyJWT](https://pyjwt.readthedocs.io) | Latest | JWT authentication |
| [passlib + bcrypt](https://passlib.readthedocs.io) | Latest | Password hashing |
| [Uvicorn](https://www.uvicorn.org) | Latest | ASGI server |

### Infrastructure
| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com) | Frontend hosting (CDN + Edge) |
| [Render](https://render.com) | Backend hosting (Web Service) |
| [Neon](https://neon.tech) | Serverless PostgreSQL |
| [Ethereum Sepolia](https://sepolia.etherscan.io) | Blockchain testnet |

---

## 📁 Project Structure

```
chaintrack/
├── 📄 render.yaml                  # Render deployment config (IaC)
├── 📄 docker-compose.yml           # Local Docker orchestration
├── 📄 .gitignore                   # Git exclusions (secrets, venv, node_modules)
├── 📄 .gitattributes               # LF line endings enforcement
│
├── 📁 backend/                     # FastAPI Python backend
│   ├── 📄 Dockerfile               # Production Docker image
│   ├── 📄 requirements.txt         # Python dependencies
│   ├── 📄 alembic.ini              # Alembic migration config
│   ├── 📄 .env.example             # Environment variable template
│   │
│   ├── 📁 alembic/                 # Database migrations
│   │   ├── env.py                  # Migration environment
│   │   └── versions/               # Migration scripts
│   │       └── 3c8cf459ec67_initial_schema.py
│   │
│   └── 📁 app/                     # Application source
│       ├── main.py                 # FastAPI app + CORS config
│       ├── database.py             # SQLAlchemy engine & session
│       │
│       ├── 📁 api/v1/             # Route handlers (thin, no business logic)
│       │   ├── api.py             # Router aggregation
│       │   ├── auth.py            # POST /auth/signup, /auth/login
│       │   ├── users.py           # GET /users/me
│       │   ├── companies.py       # GET /companies/me
│       │   ├── products.py        # CRUD + POST /products/import
│       │   ├── shipments.py       # CRUD + GET /shipments/:id/tracking
│       │   └── blockchain.py      # POST /blockchain/register
│       │
│       ├── 📁 core/               # Cross-cutting concerns
│       │   ├── config.py          # Settings (pydantic-settings)
│       │   └── security.py        # JWT encode/decode, password hashing
│       │
│       ├── 📁 models/             # SQLAlchemy ORM models
│       │   └── domain.py          # Company, User, Product, Shipment, BlockchainEvent
│       │
│       ├── 📁 schemas/            # Pydantic request/response schemas
│       │   ├── auth.py            # SignupRequest, LoginResponse
│       │   ├── core.py            # CompanyResponse, UserResponse
│       │   ├── product.py         # ProductCreate, ProductResponse
│       │   ├── shipment.py        # ShipmentCreate, ShipmentResponse
│       │   └── blockchain.py      # BlockchainEventResponse
│       │
│       └── 📁 services/           # Business logic layer
│           ├── auth_service.py    # Signup, login, token generation
│           ├── product_service.py # Product CRUD, CSV parsing
│           ├── shipment_service.py# Shipment lifecycle management
│           ├── blockchain_service.py # Ethereum event registration
│           └── logistics_service.py  # Carrier API integration
│
├── 📁 frontend/                    # React TypeScript frontend
│   ├── 📄 index.html               # Entry HTML with meta tags
│   ├── 📄 package.json             # Node dependencies
│   ├── 📄 vite.config.ts           # Vite configuration
│   ├── 📄 tailwind.config.js       # Design token configuration
│   ├── 📄 vercel.json              # Vercel deployment config (SPA rewrites)
│   ├── 📄 tsconfig.json            # TypeScript configuration
│   │
│   └── 📁 src/
│       ├── main.tsx               # App entry point
│       ├── App.tsx                # Router + QueryClient setup
│       ├── index.css              # Global styles + design system
│       │
│       ├── 📁 pages/              # Route-level page components
│       │   ├── Login.tsx          # /login
│       │   ├── Signup.tsx         # /signup
│       │   ├── Dashboard.tsx      # /dashboard — analytics overview
│       │   ├── Products.tsx       # /products — inventory management
│       │   └── Shipments.tsx      # /shipments — logistics tracking
│       │
│       ├── 📁 layouts/            # Shared layout wrappers
│       │   ├── AuthLayout.tsx     # Split-screen auth layout
│       │   └── DashboardLayout.tsx# Sidebar + topbar shell
│       │
│       ├── 📁 components/ui/      # Reusable design system components
│       │   ├── Button.tsx         # Button (primary/secondary/ghost/danger)
│       │   ├── Card.tsx           # Glass morphism card
│       │   ├── Input.tsx          # Labelled input with icon support
│       │   ├── Badge.tsx          # Status badge with ping dot
│       │   └── Modal.tsx          # Accessible modal dialog
│       │
│       └── 📁 services/           # API client layer
│           ├── api.ts             # Axios instance + JWT interceptor
│           ├── auth.ts            # login(), logout()
│           ├── products.ts        # fetchProducts(), importProducts()
│           └── shipments.ts       # fetchShipments(), createShipment()
│
├── 📁 docs/                        # Project documentation
│   ├── ARCHITECTURE.md             # Architecture decisions (source of truth)
│   ├── api-contract.md             # API endpoint contracts
│   ├── database-schema.md          # Database design reference
│   └── development-plan.md         # Feature roadmap
│
└── 📁 samples/                     # Test data files
    ├── valid_products.csv           # Sample valid CSV import
    ├── invalid_products.csv         # Sample CSV with errors (for testing)
    └── mixed_products.csv           # Mixed valid/invalid rows
```

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** (or a [Neon](https://neon.tech) free account)

### 1. Clone the repository

```bash
git clone https://github.com/priyanshukannaujiya/chaintrack.git
cd chaintrack
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY
```

### 3. Run database migrations

```bash
# From the backend/ directory
alembic upgrade head
```

### 4. Start the backend

```bash
uvicorn app.main:app --reload --port 8000
```

API is now running at → `http://localhost:8000`
Interactive docs at → `http://localhost:8000/docs`

### 5. Frontend setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend is now running at → `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql+psycopg2://user:pass@host/db?sslmode=require` |
| `SECRET_KEY` | ✅ Yes | JWT signing secret (min 32 chars) | `openssl rand -hex 32` |
| `ALGORITHM` | No | JWT algorithm | `HS256` (default) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Token TTL | `10080` (7 days) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins | `https://yourapp.vercel.app,http://localhost:5173` |

### Frontend (Vercel Environment Variables)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ Yes | Backend API base URL | `https://chaintrack-tylx.onrender.com/api/v1` |

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | ❌ | Register a new company + admin user |
| `POST` | `/auth/login` | ❌ | Authenticate and receive JWT token |

<details>
<summary><b>POST /auth/signup — Request body</b></summary>

```json
{
  "email": "admin@acme.com",
  "password": "securepassword",
  "company_name": "Acme Logistics Co.",
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
</details>

---

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/products` | ✅ | List all products for authenticated company |
| `POST` | `/products` | ✅ | Create a new product |
| `POST` | `/products/import` | ✅ | Bulk import products from CSV |

<details>
<summary><b>CSV Import format</b></summary>

```csv
name,description,quantity
Widget A,High-quality widget,100
Widget B,Economy widget,250
```

**Response:**
```json
{
  "success_count": 2,
  "errors": []
}
```
</details>

---

### Shipments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/shipments` | ✅ | List all shipments |
| `POST` | `/shipments` | ✅ | Create a new shipment |
| `GET` | `/shipments/{id}/tracking` | ✅ | Get live carrier tracking data |

---

### Blockchain

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/blockchain/register` | ✅ | Register a product event on Sepolia |
| `GET` | `/blockchain/events` | ✅ | List blockchain events for company |

---

### Other

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/me` | ✅ | Get current user profile |
| `GET` | `/companies` | ✅ | List all registered partner companies |
| `GET` | `/companies/me` | ✅ | Get current company details |
| `GET` | `/health` | ❌ | Service health check |

> 📖 Full interactive API documentation available at: [https://chaintrack-tylx.onrender.com/docs](https://chaintrack-tylx.onrender.com/docs)

---

## ☁️ Deployment

### Architecture

```
GitHub (main branch)
      │
      ├─── Vercel CI/CD ──────────────────────── Frontend (React)
      │         │                                    │
      │    Auto-deploy on push                  Vercel CDN
      │    Root dir: frontend/                  https://chaintrack-rose.vercel.app
      │
      └─── Render CI/CD ──────────────────────── Backend (FastAPI)
                │                                    │
           Auto-deploy on push                  Render Web Service
           Root dir: backend/                   https://chaintrack-tylx.onrender.com
                                                     │
                                               Neon PostgreSQL
                                               (Serverless, Free Tier)
```

### Deploy to Render (Backend)

1. Fork this repository
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect your GitHub repository
4. Render auto-detects `render.yaml` and configures the service
5. **Add your secret manually** when prompted:
   - `DATABASE_URL` → your Neon connection string

### Deploy to Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set **Root Directory** → `frontend`
4. Add environment variable (optional, default auto-fallback to live backend is built in):
   - `VITE_API_BASE_URL` → `https://chaintrack-tylx.onrender.com/api/v1`
5. Click **Deploy**

### Live Production CORS Settings

In Render → **chaintrack** → Environment:
```
ALLOWED_ORIGINS=https://chaintrack-rose.vercel.app,http://localhost:5173
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feat/your-feature`
5. **Open** a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org):

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Maintenance, dependencies |
| `docs:` | Documentation changes |
| `refactor:` | Code refactor (no feature/bug) |
| `style:` | UI/CSS changes |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by [Priyanshu Kannaujiya](https://github.com/priyanshukannaujiya)

⭐ **Star this repo** if you find it useful!

</div>
