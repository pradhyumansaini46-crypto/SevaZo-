# Sevazo Database Architecture & Schema Documentation

## 1. Database Engine & Relational Design

* **Database Engine**: PostgreSQL 16 (Relational, ACID-compliant)
* **ORM**: Prisma Client v6
* **Identifier Standard**: Collision-resistant UUIDs across all primary and foreign keys.
* **Auditability & Temporal Tracking**: Every model enforces `createdAt` and `updatedAt`. Core business records implement soft-deletion via `deletedAt`.

---

## 2. Core Relational Domains (54 Models)

### Domain 1: Identity, RBAC & Security
* `admin_users`: Internal administrative staff with hashed passwords (bcrypt), TOTP MFA secrets, and role relationships.
* `roles`: Named administrative security profiles (`SUPER_ADMIN`, `ADMIN`, `OPERATIONS_MANAGER`, etc.).
* `permissions`: Atomic action grants (e.g. `users:read`, `orders:cancel`, `settlements:approve`).
* `role_permissions`: Many-to-many junction mapping permissions to roles.
* `admin_sessions`: Active session tracking with token hashes, user agents, and IP addresses for remote revocation.
* `audit_logs`: Immutable append-only log capturing mutating HTTP operations (`POST`, `PUT`, `PATCH`, `DELETE`).

### Domain 2: Vendor & Merchant Architecture
* `vendors`: Registered merchants with business identifiers, verification status, and commission rates.
* `stores`: Physical retail storefronts with geocoded coordinates (`latitude`, `longitude`) and operating hours.
* `vendor_documents`: KYC compliance artifacts (GST, FSSAI, PAN) with verification timestamps.
* `vendor_bank_accounts`: Disbursal accounts with IFSC codes and verification flags.

### Domain 3: Rider Fleet & Logistics
* `riders`: Courier delivery partners with vehicle types, status (`APPROVED`, `UNDER_REVIEW`), ratings, and online toggles.
* `rider_vehicles`: Registered motorcycles, scooters, or EVs with registration numbers.
* `rider_documents`: Driver licenses, RC books, background checks.
* `rider_locations`: High-frequency location updates persisted periodically from Redis cache.
* `delivery_zones`: Polygonal or radius-based dispatch boundaries.

### Domain 4: Catalog & Multi-Vendor Inventory
* `categories`: Hierarchical category tree supporting nested children.
* `brands`: Verified brand metadata and manufacturer profiles.
* `products`: Multi-attribute goods with vendor references, SKUs, and approval moderation status.
* `product_variants`: Size, color, and packaging variations with discrete stock counts.
* `product_images`: Ordered visual asset URLs.
* `inventories`: Available stock, safety reserves, and low-stock alerting thresholds.
* `inventory_transactions`: Ledger tracking additions, reservations, releases, and fulfillment deductions.

### Domain 5: Orders, Fulfillment & Dispatch
* `orders`: Authoritative commercial orders with calculated subtotals, tax rates, delivery fees, and order states.
* `order_items`: Line-item snapshots with unit prices and quantity.
* `deliveries`: Logistics tasks with OTP verification (`pickupOtp`, `deliveryOtp`), proof photos, and distance calculations.
* `delivery_status_history`: Immutable timeline of fulfillment milestones.

### Domain 6: Finance, Ledgers & Settlements
* `payments`: Payment intents, payment gateway transaction references, and statuses (`PAID`, `REFUNDED`).
* `refunds`: Refund authorizations with admin audit tracking.
* `commissions`: Take-rate rules by category and merchant.
* `settlements`: Disbursal accounting batches tracking net payouts after commission deductions.
