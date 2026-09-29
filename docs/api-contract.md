# ChainTrack API Contract

Base URL: `/api/v1`

## Authentication (`/auth`)
*   `POST /auth/signup`
    *   Request: `email`, `password`, `company_name`, `role`
    *   Response: `user_id`, `company_id`, `token`
*   `POST /auth/login`
    *   Request: `email`, `password`
    *   Response: `token`, `role`, `company_id`
*   `POST /auth/logout`
    *   Request: None (Requires Auth)

## Users & Companies
*   `GET /users/me`
    *   Response: `id`, `email`, `role`, `company_id`
*   `GET /companies/me`
    *   Response: `id`, `name`

## Products (`/products`)
*   `GET /products`
    *   Query: `page`, `limit`, `status`
    *   Response: List of products (paginated)
*   `POST /products`
    *   Request: `name`, `description`, `quantity`
    *   Response: Product object
*   `GET /products/{id}`
    *   Response: Product object
*   `POST /products/import`
    *   Request: `multipart/form-data` (CSV/XLSX)
    *   Response: Import result (success count, failure list with row-level errors)

## Shipments (`/shipments`)
*   `GET /shipments`
    *   Query: `page`, `limit`, `status`
    *   Response: List of shipments
*   `POST /shipments`
    *   Request: `product_id`, `to_company_id`, `quantity`
    *   Response: Shipment object
*   `POST /shipments/{id}/transfer`
    *   Request: None
    *   Response: Updated shipment object
*   `POST /shipments/{id}/receive`
    *   Request: None
    *   Response: Updated shipment object

## Blockchain (`/blockchain`)
*   `POST /blockchain/events`
    *   Request: `product_id`, `transaction_hash`, `event_type`
    *   Response: Event tracking object (status: PENDING)
*   `GET /blockchain/events/{transaction_hash}`
    *   Response: Event tracking object status
