# ChainTrack Database Schema

## Core Principles
*   **Multi-Tenancy**: All tenant-specific tables must have a `company_id` foreign key.
*   **Primary Database**: Neon PostgreSQL.

## Tables

### `companies`
*   `id` (UUID, Primary Key)
*   `name` (String, Not Null)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### `users`
*   `id` (UUID, Primary Key)
*   `company_id` (UUID, Foreign Key -> companies.id, Indexed)
*   `email` (String, Unique, Not Null)
*   `hashed_password` (String, Not Null)
*   `role` (Enum: ADMIN, MANUFACTURER, WAREHOUSE, DISTRIBUTOR, RETAILER)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### `products`
*   `id` (UUID, Primary Key)
*   `company_id` (UUID, Foreign Key -> companies.id, Indexed)
*   `name` (String, Not Null)
*   `description` (Text)
*   `quantity` (Numeric, Not Null)
*   `status` (Enum: DRAFT, REGISTERED, IN_TRANSIT, DELIVERED)
*   `blockchain_hash` (String, Nullable, Indexed)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### `partners`
*   `id` (UUID, Primary Key)
*   `company_id` (UUID, Foreign Key -> companies.id, Indexed)
*   `partner_company_id` (UUID, Foreign Key -> companies.id)
*   `relationship_type` (Enum: SUPPLIER, DISTRIBUTOR, BUYER)
*   `created_at` (Timestamp)

### `shipments`
*   `id` (UUID, Primary Key)
*   `company_id` (UUID, Foreign Key -> companies.id, Indexed)
*   `product_id` (UUID, Foreign Key -> products.id, Indexed)
*   `from_company_id` (UUID, Foreign Key -> companies.id)
*   `to_company_id` (UUID, Foreign Key -> companies.id)
*   `status` (Enum: PENDING, SHIPPED, RECEIVED, CANCELLED)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### `blockchain_events`
*   `id` (UUID, Primary Key)
*   `company_id` (UUID, Foreign Key -> companies.id, Indexed)
*   `product_id` (UUID, Foreign Key -> products.id)
*   `transaction_hash` (String, Unique, Indexed)
*   `event_type` (String)
*   `status` (Enum: PENDING, CONFIRMED, FAILED, SYNC_REQUIRED)
*   `created_at` (Timestamp)
