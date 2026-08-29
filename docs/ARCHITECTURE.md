# Sevazo Platform Architecture

## 1. System Overview

Sevazo is an enterprise-grade multi-sided commerce and logistics ecosystem engineered with a **Central Control Plane (Admin Portal)** governing three operational pillars:
1. **Customers**: Product discovery, cart management, checkout, order tracking.
2. **Vendors**: Store management, product catalog, inventory tracking, order fulfillment, settlements.
3. **Riders**: Hyperlocal dispatch, navigation, pickup verification, proof-of-delivery (OTP/Photo), earnings.

```
                         ┌─────────────────────────────────┐
                         │   Admin Portal (Next.js 15)     │
                         └────────────────┬────────────────┘
                                          │
                                 /api/v1/admin/*
                                          │
┌─────────────────────────┐               │               ┌────────────────────────┐
│  Customer Mobile (RN)   │               ▼               │   Vendor Mobile (RN)   │
│   /api/v1/customers/*   ├───────►┌──────────────┐◄──────┤   /api/v1/vendors/*    │
└─────────────────────────┘        │              │       └────────────────────────┘
                                   │  Central API │
┌─────────────────────────┐        │   (NestJS)   │
│    Rider Mobile (RN)    ├───────►│              │
│     /api/v1/riders/*    │        └──────┬───────┘
└─────────────────────────┘               │
                                   ┌──────┴──────┐
                                   ▼             ▼
                              PostgreSQL       Redis
                              (54 Models)    (Pub/Sub,
                              (Authoritative  Queues,
                                  State)      Locks)
```

---

## 2. Core Architectural Principles

1. **Single Authoritative Source of Truth**:
   The frontend clients (`admin`, `customer`, `vendor`, `rider`) never dictate business state, order statuses, financial computations, permissions, or inventory levels. Every mutation is authorized, validated, and processed transactionally on the NestJS backend.

2. **Unified Monorepo with Strict Package Boundaries**:
   * `apps/admin`: Central administrative web dashboard.
   * `apps/api`: NestJS central backend API.
   * `packages/types`: Shared TypeScript domain models & DTOs.
   * `packages/validation`: Zod schemas enforcing input and contract integrity.
   * `packages/api-client`: Type-safe client consuming standard envelopes.
   * `packages/config`: Platform constants, CORS, and role definitions.
   * `packages/database`: Prisma schema and database connection singleton.
   * `packages/ui`: Design tokens and status presentation formatters.

3. **Transaction-Safe Financial & Order Lifecycle**:
   * Order states follow a strict non-arbitrary state machine (`CREATED` → `PAYMENT_PENDING` → `CONFIRMED` → `PREPARING` → `READY_FOR_PICKUP` → `RIDER_ASSIGNED` → `PICKED_UP` → `IN_TRANSIT` → `DELIVERED`).
   * Financial ledger records every transaction, refund, commission deduction, and settlement batch atomically with PostgreSQL `$transaction`.
