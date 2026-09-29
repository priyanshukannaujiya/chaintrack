# ChainTrack Architecture

This document is the authoritative source for the technology stack, system architecture, database architecture, authentication, API, blockchain, and deployment configuration for ChainTrack.

## Technology Stack (LOCKED)
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, TanStack React Query, Axios, Recharts, Lucide React
*   **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic
*   **Database**: Neon PostgreSQL
*   **Blockchain**: Solidity, Ethers.js, MetaMask, Sepolia, Ganache (local)
*   **File Processing**: Pandas, openpyxl
*   **Deployment**: Vercel (frontend), Render/Railway (backend), Neon PostgreSQL, Sepolia

## System Architecture
*   **Frontend-Backend Communication**: React -> Axios / React Query -> FastAPI -> Service Layer -> SQLAlchemy -> Neon PostgreSQL
*   **Business Logic**: Handled exclusively in the Backend Service Layer. Routes are thin; no business logic in FastAPI route handlers or React.
*   **Environment Separation**: Strict separation between Development, Testing, and Production environments using `.env` files.

## Blockchain Architecture
*   **Flow**: React -> Ethers.js -> MetaMask -> Solidity -> Sepolia
*   **Data Separation**: Blockchain is NOT the primary database. It stores registration events, ownership transfers, critical movement events, timestamps, and wallet addresses. PostgreSQL stores all business/operational data.
*   **Wallet Security**: MetaMask handles signing. Backend never receives or stores private keys/seed phrases.

## Multi-Tenancy & Authorization
*   **Data Isolation**: Every tenant-owned table must contain `company_id`. All queries must be scoped by the authenticated user's `company_id`.
*   **Authentication**: Handled by the backend. No plaintext passwords or private keys are stored.
*   **Authorization**: Server-side role checking enforced on every protected API endpoint.
    *   **Roles**: ADMIN, MANUFACTURER, WAREHOUSE, DISTRIBUTOR, RETAILER

## API Architecture
*   **API-First**: Defined contracts using Pydantic schemas. Frontend types must strictly match backend schemas (e.g., `product_id`).
*   **Versioning**: All APIs must be prefixed with `/api/v1/`.
*   **Error Handling**: Standard HTTP status codes (400, 401, 403, 404, 409, 422, 500) with safe user-facing messages.

## Database & Migrations
*   **Migrations**: Only Alembic is used for schema changes. No manual production database modifications.
*   **Access**: Only FastAPI accesses the database using `DATABASE_URL`. Frontend never connects directly.
