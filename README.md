# Sevazo — Unified Commerce & Logistics Platform Monorepo

Sevazo is an enterprise-grade multi-sided commerce and hyperlocal logistics platform built with a production-grade monorepo architecture.

---

## 📂 Monorepo Structure

```
sevazo/
├── apps/
│   ├── admin/             # Central Control Plane (Next.js 15 App Router + Tailwind)
│   ├── api/               # Central Commerce & Logistics API (NestJS 11 + Prisma)
│   ├── customer/          # Customer Mobile App (React Native Expo) [Preserved]
│   ├── vendor/            # Merchant Mobile App (React Native Expo) [Preserved]
│   └── rider/             # Delivery Partner Mobile App (React Native Expo) [Preserved]
├── packages/
│   ├── types/             # Shared TypeScript domain models & DTOs (@sevazo/types)
│   ├── validation/        # Shared Zod schemas & contracts (@sevazo/validation)
│   ├── api-client/        # Type-safe Axios client with JWT refresh (@sevazo/api-client)
│   ├── config/            # Platform constants & environment rules (@sevazo/config)
│   ├── database/          # Prisma ORM schema & client singleton (@sevazo/database)
│   └── ui/                # Shared design tokens & status formatters (@sevazo/ui)
├── infra/
│   ├── docker/            # Docker Compose services for PostgreSQL 16 & Redis 7
│   ├── database/          # SQL initialization & backup scripts
│   └── redis/             # Redis persistent caching configurations
├── docs/
│   ├── ARCHITECTURE.md    # System design, data flow, and boundaries
│   ├── DATABASE.md        # 54 Relational models, constraints, and indexes
│   ├── api/API.md         # 25 Admin REST API modules and OpenAPI specs
│   ├── security/RBAC.md   # 7 Administrative roles and granular permissions
│   ├── security/SECURITY.md # OWASP hygiene, token rotation & audit logging
│   └── deployment/DEPLOYMENT.md # Docker deployment & environment guides
└── docker-compose.yml     # Local developer infrastructure
```

---

## 🚀 Quick Start Guide

### 1. Initialize Infrastructure
```bash
# Start PostgreSQL (Port 5432) and Redis (Port 6379)
docker-compose up -d
```

### 2. Install Dependencies & Build Packages
```bash
npm install
npm run prisma:generate
```

### 3. Run Database Migrations & Seed Default Admin
```bash
npm run prisma:migrate
npm run seed --workspace=apps/api
```
* **Default Super Admin**: `admin@sevazo.com`
* **Default Password**: `Admin@123456`

### 4. Start Development Applications
```bash
# Start Central Backend API (Listening on http://localhost:4000/api/v1)
npm run dev:api

# Start Admin Web Portal (Listening on http://localhost:3000)
npm run dev:admin
```

* **Swagger API Documentation**: `http://localhost:4000/api/docs`
* **Admin Portal**: `http://localhost:3000/login`

---

## 🛡️ Administrative Roles & RBAC

1. **`SUPER_ADMIN`**: Full platform authority including RBAC, security settings, and fees.
2. **`ADMIN`**: General operational oversight.
3. **`OPERATIONS_MANAGER`**: Vendor, rider, and order fulfillment supervision.
4. **`CATALOG_MANAGER`**: Category taxonomy, product listings moderation, and inventory auditing.
5. **`FINANCE_MANAGER`**: Payments, refunds, commissions, and vendor settlements.
6. **`LOGISTICS_MANAGER`**: Fleet oversight, dispatch boundaries, and delivery tracking.
7. **`SUPPORT_AGENT`**: Customer/vendor support tickets and dispute arbitration.
# SevaZo
# SevaZo-
