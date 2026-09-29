# ChainTrack Development Plan

This plan strictly enforces the phased development process to ensure architectural integrity and production safety. We DO NOT continue automatically to the next phase until the current phase passes its acceptance criteria.

## PHASE 0: Requirements + Architecture
*   Define single source of truth (ARCHITECTURE.md).
*   Define database schema (database-schema.md).
*   Define API contracts (api-contract.md).
*   *Status: In Progress (Pending validation)*

## PHASE 1: Database Design
*   Initialize FastAPI + SQLAlchemy + Alembic.
*   Create SQLAlchemy models mapping to database-schema.md.
*   Generate and run Alembic migrations against Neon PostgreSQL.

## PHASE 2: API Contracts
*   Define Pydantic v2 schemas for all request/response models.
*   Setup thin FastAPI route handlers returning mocked data (matching schemas).

## PHASE 3: Authentication and Authorization
*   Implement signup, login, logout.
*   Implement JWT/Session validation.
*   Implement Role-Based Access Control (RBAC) middleware/dependencies.

## PHASE 4: Backend Services
*   Implement business logic in the Service layer (ProductService, ShipmentService, etc.).
*   Connect routes to services, and services to SQLAlchemy repositories.

## PHASE 5: Frontend UI
*   Setup React, Vite, Tailwind CSS, React Query.
*   Implement design system (typography, buttons, modals).
*   Build pages for Auth, Dashboard, Products, Shipments.

## PHASE 6: Frontend/Backend Integration
*   Connect React Query to FastAPI endpoints.
*   Implement strict error handling and loading states.

## PHASE 7: CSV/XLSX Import
*   Implement secure file processing.
*   Add file validation, schema validation, and duplicate detection.
*   Use DB transactions (rollback on failure).

## PHASE 8: Blockchain Integration
*   Develop and compile Solidity smart contract.
*   Integrate Ethers.js and MetaMask on the frontend.
*   Implement safe transaction lifecycle (Pending -> Confirmed).

## PHASE 9: Testing
*   Unit, API, and Integration tests.
*   Security and Tenant-isolation tests.

## PHASE 10: Deployment
*   Deploy Frontend to Vercel.
*   Deploy Backend to Render/Railway.
*   Configure production environment variables.

## PHASE 11: Production Verification
*   Execute Final End-to-End Test as per engineering rules.
