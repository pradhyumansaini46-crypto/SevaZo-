# Sevazo Vendor Application Architecture & Implementation Guide

## 1. Vendor Architecture Overview

The **Sevazo Vendor Application** is the merchant-facing mobile application of the Sevazo ecosystem. It allows approved store owners to manage retail and restaurant operations, inventory, and order fulfillment.

```
┌─────────────────────────────────────────────────────────────┐
│                 Sevazo Vendor Mobile App                    │
│        (React Native Expo + TypeScript + Zustand)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                HTTPS REST (/api/v1/vendor/*)
                 Bearer JWT Authentication
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Central NestJS Backend                    │
│  - VendorAuthGuard (Tenant extraction & token validation)    │
│  - Strict Server-Side IDOR Defense                          │
│  - Universal 5-State Stock Transaction Engine               │
│  - Order Stage Machine (Cannot transition to DELIVERED)     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
    PostgreSQL 16 Database             Redis 7 Engine
    - Multi-tenant data partition      - Session invalidation
    - ACID stock transactions          - Live counter pub/sub
    - Append-only audit logs           - High-concurrency queues
```

---

## 2. Database Changes & Relational Schema

The central PostgreSQL schema models the complete vendor domain:

1. **`vendors`**: Central merchant profile with legal entity type, business category, verification status (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `SUSPENDED`), commission rate, and rating.
2. **`stores`**: Physical fulfillment nodes with geocoded coordinates (`latitude`, `longitude`), prep time SLAs, delivery radius, and open/closed toggles.
3. **`vendor_documents`**: Statutory KYC documents (PAN, GSTIN, FSSAI, Trade License) with presigned URLs and admin verification stamps.
4. **`vendor_bank_accounts`**: Disbursal accounts with masked account numbers and IFSC routing details.
5. **`vendor_addresses`**: Physical store premises and legal registered offices.
6. **`vendor_business_hours`**: Day-of-week operating time windows and holiday closures.
7. **`products`**: Multi-variant SKU definitions with base pricing, compare-at pricing, tax rates, HSN codes, and admin approval flags (`isApproved`).
8. **`product_variants`**: Size, color, and packaging variations with discrete SKUs and stock numbers.
9. **`product_images`**: S3-compatible visual assets with primary image flags and sort orders.
10. **`inventories`**: 5-state stock counters per store/product/variant combination.
11. **`inventory_transactions`**: Append-only transactional ledger tracking stock transitions.
12. **`vendor_settings`**: Notification preferences, sound alerts, and order acceptance modes.

---

## 3. API Endpoints Catalog (`/api/v1/vendor/*`)

All vendor endpoints reuse the standardized Sevazo envelope:
* **Success**: `{ success: true, data: { ... }, message: "...", requestId: "..." }`
* **Error**: `{ success: false, error: { code: "...", message: "..." }, requestId: "..." }`

### 3.1 Authentication & Onboarding
* `POST /api/v1/vendor/auth/send-otp`: Sends mobile OTP challenge.
* `POST /api/v1/vendor/auth/verify-otp`: Verifies OTP and returns access token + refresh token.
* `GET /api/v1/vendor/auth/me`: Retrieves current authenticated vendor profile.
* `GET /api/v1/vendor/onboarding/state`: Retrieves current onboarding step and checklist completion.
* `POST /api/v1/vendor/onboarding/step/:step`: Persists data for onboarding steps 1 through 9.
* `POST /api/v1/vendor/onboarding/submit`: Submits application to the Admin review queue.
* `POST /api/v1/vendor/onboarding/documents/presigned-url`: Generates S3 presigned upload URL.

### 3.2 Store & Operations
* `GET /api/v1/vendor/stores/primary`: Fetches primary storefront profile.
* `PATCH /api/v1/vendor/stores/primary`: Updates store open/close status, prep times, and radius.
* `PUT /api/v1/vendor/stores/primary/hours`: Updates operating business hours schedule.

### 3.3 Catalog & Products
* `GET /api/v1/vendor/products`: Lists products owned by the vendor with search & filtering.
* `GET /api/v1/vendor/products/:id`: Fetches product details, variants, and images.
* `POST /api/v1/vendor/products`: Creates a new product (submitted for admin moderation).
* `PATCH /api/v1/vendor/products/:id`: Edits product details, pricing, and tax rates.
* `DELETE /api/v1/vendor/products/:id`: Deactivates or soft-deletes a product.
* `POST /api/v1/vendor/products/:id/variants`: Adds a variant to an existing product.
* `DELETE /api/v1/vendor/product-variants/:variantId`: Removes a product variant.

### 3.4 5-State Inventory Engine
* `GET /api/v1/vendor/inventory`: Lists store inventory with low-stock alerts.
* `POST /api/v1/vendor/inventory/adjust`: Executes transactional stock adjustments.
* `GET /api/v1/vendor/inventory/logs`: Fetches immutable stock transaction logs.

$$\text{available\_stock} = \text{physical\_stock} - \text{reserved\_stock} - \text{damaged\_stock}$$

Transaction Types: `PURCHASE`, `ADJUSTMENT`, `RESERVATION`, `RELEASE`, `SALE`, `RETURN`, `DAMAGE`.

### 3.5 Order Management & Pipeline
* `GET /api/v1/vendor/orders`: Paginated orders partitioned by stage tab (`NEW`, `ACCEPTED`, `PREPARING`, `READY`, `HISTORY`).
* `GET /api/v1/vendor/orders/live-stats`: Counter telemetry for active pipeline badges.
* `GET /api/v1/vendor/orders/:id`: Full order breakdown (items, customer details, rider assignment).
* `PATCH /api/v1/vendor/orders/:id/accept`: Accepts incoming order (`PENDING` $\rightarrow$ `CONFIRMED`).
* `PATCH /api/v1/vendor/orders/:id/reject`: Rejects incoming order (`CANCELLED`, `cancelledBy: VENDOR`).
* `PATCH /api/v1/vendor/orders/:id/preparing`: Transitions order (`CONFIRMED` $\rightarrow$ `PREPARING`).
* `PATCH /api/v1/vendor/orders/:id/ready`: Marks order ready for rider pickup (`READY_FOR_PICKUP`).
* **Delivery Guard**: Vendors cannot mark orders `DELIVERED`.

### 3.6 Finance & Settlements
* `GET /api/v1/vendor/finance/summary`: Gross sales, commission deductions, and pending payouts.
* `GET /api/v1/vendor/finance/transactions`: Commission deduction ledger per completed order.
* `GET /api/v1/vendor/settlements`: Read-only disbursal accounting batches.

---

## 4. Mobile Screen Map (`apps/vendor`)

```
RootNavigator
│
├── SplashScreen
├── WelcomeScreen
├── LoginScreen (Mobile + Password / OTP)
├── OtpVerificationScreen
├── RegisterScreen
│
├── Onboarding Stack:
│   ├── OnboardingWizardScreen (9-Step Step-by-Step Flow)
│   │   ├── Step 1: Business Type & Category
│   │   ├── Step 2: Personal & Owner Information
│   │   ├── Step 3: Legal Entity & Tax Identifiers (PAN, GSTIN, FSSAI)
│   │   ├── Step 4: Physical Store Address & Geolocation
│   │   ├── Step 5: Statutory Document Uploads (S3 Presigned)
│   │   ├── Step 6: Bank Account & Payout Preference
│   │   ├── Step 7: Store Profile & Description
│   │   ├── Step 8: Delivery Preferences & Radius
│   │   └── Step 9: Review & Submission
│   ├── ApplicationSubmittedScreen
│   ├── StatusTrackerScreen (Live Status Polling)
│   ├── CorrectionScreen (Resubmit Rejected Documents)
│   └── SuspendedScreen
│
└── MainTabNavigator (Unlocked upon APPROVED status):
    ├── DashboardScreen (Live Counters, Today's Sales, Low Stock, Pipeline)
    │
    ├── Orders Stack:
    │   ├── OrdersScreen (Tabs: New, Preparing, Ready, History)
    │   └── OrderDetailModal (Accept, Reject, Prep Time, Item Checklist)
    │
    ├── Products Stack:
    │   ├── ProductsListScreen (Search, Category Filters, In Stock Toggle)
    │   ├── AddProductScreen (Title, Price, MRP, Tax, SKU, Weight)
    │   ├── EditProductScreen
    │   ├── VariantsScreen (Size/Color Matrix)
    │   └── ProductImagesScreen (Multi-Image Upload)
    │
    ├── Inventory Stack:
    │   ├── InventoryListScreen (Stock Count Badges)
    │   ├── LowStockScreen (Critical Alerts)
    │   └── StockAdjustmentScreen (Audit Adjustment, Damage, Inward Restock)
    │
    └── Store & Settings Stack:
        ├── StoreProfileScreen
        ├── StoreHoursScreen (Weekly Schedule)
        ├── StoreStatusScreen (Open/Close Toggle)
        ├── RevenueScreen (Financial Analytics)
        ├── SettlementsScreen (Read-Only Disbursals)
        ├── PromotionsScreen (Coupons)
        ├── NotificationsScreen
        ├── SupportScreen (Ticket Submission)
        └── SettingsScreen
```

---

## 5. State Management Strategy

1. **Server State (TanStack Query v5)**:
   * Real-time queries for orders, live pipeline statistics, product listings, and inventory counts.
   * Configured with 30s background refetch intervals and optimistic updates on order status transitions.
2. **Client State (Zustand Stores)**:
   * `authStore`: Access token, refresh token, vendor profile, and onboarding step persistence.
   * `orderStore`: Active orders cache and unread sound alert states.
   * `networkStore`: Offline/online connectivity detection.
   * `storeConfigStore`: Local store open/close state and sound preferences.
3. **Form State (React Hook Form + Zod)**:
   * Strict validation for Indian statutory tax identifiers (PAN, GSTIN, FSSAI), PIN codes, and bank accounts.

---

## 6. Security & Multi-Tenant IDOR Protection

1. **Zero Client Trust**:
   * The vendor cannot submit arbitrary SQL IDs or mutate records outside their tenant boundary.
2. **Server-Side Enforcement**:
   * Every request is verified via `VendorAuthGuard`.
   * The authenticated `vendor.id` is extracted from the cryptographically verified JWT payload (`sub`).
   * Every database query scopes access strictly with `where: { vendorId }` or `where: { store: { vendorId } }`.
3. **Delivery Restriction**:
   * A vendor cannot mark an order `DELIVERED`. Only Riders (with customer OTP) or Super Admins can finalize delivery.
4. **Financial Safety**:
   * Settlements and commission deductions are strictly read-only for vendors.

---

## 7. Integration Points with Admin Portal

```
[Vendor Onboarding Submission]
             ↓
   status: "SUBMITTED"
             ↓
[Admin Portal Review Queue]
   /users/vendors/:id
             ↓
[Admin Action: APPROVED]
   - Vendor status becomes "APPROVED"
   - Next login opens MainTabNavigator
             ↓
[Vendor Creates Products]
   - Product status: "PENDING_APPROVAL"
             ↓
[Admin Moderates Product]
   /products/approval
   - Admin approves listing -> becomes visible to Customers
```

---

## 8. Testing Strategy & Validation Results

* **Inventory Unit Tests (`inventory.service.spec.ts`)**:
  * Verified 5-state stock formula: $\text{available\_stock} = \text{physical\_stock} - \text{reserved\_stock} - \text{damaged\_stock}$.
  * Verified all 7 transaction types (`PURCHASE`, `ADJUSTMENT`, `RESERVATION`, `RELEASE`, `SALE`, `RETURN`, `DAMAGE`).
  * Insufficient stock throws `BadRequestException`.
  * Low-stock threshold detection flags `isLowStock: true`.
* **Order Lifecycle Tests (`vendor-order.service.spec.ts`)**:
  * Enforced status transitions (`PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY_FOR_PICKUP`).
  * Verified rejection records `cancelledBy: VENDOR`.
  * Verified delivery method is not exposed to vendors.
* **Tenant Isolation Tests (`vendor-ownership.spec.ts`)**:
  * Verified Vendor B receives `NotFoundException` when attempting to query or update Vendor A's products, orders, inventory, or settlements.
* **Test Results**: **27 / 27 unit tests passed with 0 errors**.

---

## 9. Setup & Run Instructions

```bash
# 1. Start Infrastructure (PostgreSQL & Redis)
cd Sevaa1
docker-compose up -d

# 2. Start Central Backend API (Listening on http://localhost:4000/api/v1)
npm run dev:api

# 3. Start Vendor Mobile App (Expo Metro Bundler)
cd apps/vendor
npm start

# Run on Android Emulator:
npm run android

# Run on iOS Simulator:
npm run ios

# Run in Web Browser for Testing:
npm run web
```
