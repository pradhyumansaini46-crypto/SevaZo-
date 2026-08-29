# Sevazo Central Admin API Documentation

## 1. Specification & Protocol Standards

* **Base URL**: `/api/v1/admin`
* **Protocol**: REST over HTTPS
* **Interactive Documentation**: `http://localhost:4000/api/docs` (Swagger UI)
* **Authentication**: Bearer JWT in `Authorization` header (`Bearer <access_token>`)
* **Standard Response Envelope**:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Resource fetched successfully",
    "requestId": "req_8b91a24d",
    "timestamp": "2026-08-28T18:00:00.000Z"
  }
  ```
* **Standard Error Envelope**:
  ```json
  {
    "success": false,
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "Vendor with specified ID does not exist"
    },
    "requestId": "req_8b91a24d",
    "timestamp": "2026-08-28T18:00:00.000Z"
  }
  ```

---

## 2. Admin Modules & Endpoint Inventory

| Module | Method & Endpoint | Description | Guard / RBAC |
|---|---|---|---|
| **Auth** | `POST /auth/login` | Email/password authentication, returns JWT + refresh token | Public |
| **Auth** | `POST /auth/mfa/verify` | TOTP 6-digit challenge completion | Public |
| **Auth** | `GET /auth/me` | Fetch active authenticated admin profile | `JwtAuthGuard` |
| **Auth** | `POST /auth/logout` | Revoke current session in database | `JwtAuthGuard` |
| **Dashboard** | `GET /analytics/dashboard` | Executive KPI counts, telemetry trends, and action queues | `PermissionsGuard('dashboard:read')` |
| **Customers** | `GET /customers` | Paginated customer accounts with search & filters | `PermissionsGuard('customers:read')` |
| **Customers** | `GET /customers/:id` | Detailed customer profile, addresses, order history | `PermissionsGuard('customers:read')` |
| **Customers** | `PATCH /customers/:id/status`| Block, suspend, or reactivate customer | `PermissionsGuard('customers:manage')` |
| **Vendors** | `GET /vendors` | Merchant directory with status filter | `PermissionsGuard('vendors:read')` |
| **Vendors** | `GET /vendors/:id` | Vendor storefront, banking details, and documents | `PermissionsGuard('vendors:read')` |
| **Vendor KYC** | `PATCH /vendors/:id/kyc` | Approve or reject vendor KYC with audit notes | `PermissionsGuard('vendors:approve')` |
| **Riders** | `GET /riders` | Fleet roster with vehicle types and availability | `PermissionsGuard('riders:read')` |
| **Riders** | `GET /riders/:id` | Detailed rider file, documents, vehicle verification | `PermissionsGuard('riders:read')` |
| **Rider KYC** | `PATCH /riders/:id/kyc` | Approve, reject, or suspend rider credentials | `PermissionsGuard('riders:approve')` |
| **Categories**| `GET /categories` | Hierarchical category taxonomy | `PermissionsGuard('catalog:read')` |
| **Categories**| `POST /categories` | Create category with slug, image, and display order | `PermissionsGuard('catalog:manage')` |
| **Brands** | `GET /brands` | Catalog brand directory | `PermissionsGuard('catalog:read')` |
| **Brands** | `POST /brands` | Create manufacturer brand entry | `PermissionsGuard('catalog:manage')` |
| **Products** | `GET /products` | Multi-vendor product catalog with pagination | `PermissionsGuard('catalog:read')` |
| **Products** | `GET /products/:id` | Product variants, images, pricing, and stock | `PermissionsGuard('catalog:read')` |
| **Products** | `PATCH /products/:id/moderate`| Catalog moderation: approve or reject listing | `PermissionsGuard('catalog:manage')` |
| **Orders** | `GET /orders` | Unified orders list with status filtering | `PermissionsGuard('orders:read')` |
| **Orders** | `GET /orders/:id` | Complete order breakdown, items, logistics, and payments | `PermissionsGuard('orders:read')` |
| **Orders** | `PATCH /orders/:id/status`| Force update order lifecycle status with audit notes | `PermissionsGuard('orders:manage')` |
| **Deliveries**| `GET /deliveries` | Real-time delivery tasks and fulfillment tracking | `PermissionsGuard('logistics:read')` |
| **Payments** | `GET /payments` | Gateway reconciliation and transaction records | `PermissionsGuard('finance:read')` |
| **Refunds** | `GET /refunds` | Customer refund requests queue | `PermissionsGuard('finance:read')` |
| **Refunds** | `POST /refunds/process` | Approve or reject refund with gateway payout | `PermissionsGuard('finance:manage')` |
| **Settlements**| `GET /settlements` | Vendor and rider payout accounting batches | `PermissionsGuard('finance:read')` |
| **Settlements**| `POST /settlements/:id/approve`| Approve net payout transfer | `PermissionsGuard('finance:manage')` |
| **Commissions**| `GET /commissions` | Category and vendor take-rate schedules | `PermissionsGuard('finance:read')` |
| **Coupons** | `POST /coupons` | Issue promotional coupons with limits | `PermissionsGuard('marketing:manage')` |
| **Support** | `GET /support/tickets` | Multi-channel support tickets queue | `PermissionsGuard('support:read')` |
| **Support** | `PATCH /support/tickets/:id/status`| Resolve or reassign customer/vendor ticket | `PermissionsGuard('support:manage')` |
| **Audit Logs** | `GET /audit` | Immutable security activity log with pagination | `PermissionsGuard('audit:read')` |
| **Settings** | `GET /settings` | Platform operating settings, radius, and fees | `PermissionsGuard('settings:read')` |
| **Settings** | `PUT /settings` | Update global parameters | `PermissionsGuard('settings:manage')` |
