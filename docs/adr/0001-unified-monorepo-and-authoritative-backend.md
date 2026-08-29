# ADR 0001: Unified Monorepo & Authoritative Central Backend Architecture

## Context
Sevazo consists of 4 distinct user-facing interfaces:
1. Admin Web Portal (Next.js 15)
2. Customer Mobile App (React Native Expo)
3. Vendor Mobile App (React Native Expo)
4. Rider Mobile App (React Native Expo)

Operating these systems as isolated codebases with disconnected micro-backends leads to duplicated domain models, out-of-sync API contracts, disparate authentication silos, and vulnerable client-side status transitions.

## Decision
1. **Adopt a Unified Monorepo Structure (`apps/*`, `packages/*`, `infra/*`, `docs/*`)**:
   Code and validation contracts reside in shared packages (`@sevazo/types`, `@sevazo/validation`, `@sevazo/api-client`, `@sevazo/config`, `@sevazo/database`, `@sevazo/ui`), linked natively via npm workspaces.
2. **Enforce a Single Authoritative Central Backend (`apps/api`)**:
   * All business logic, orders, payments, inventories, settlements, and permissions are authoritative on the NestJS backend and PostgreSQL database.
   * Client-side applications cannot mutate order statuses, confirm payments, or approve vendors directly.
3. **Phase 1 Execution Scope**:
   * Build and harden the central Admin Portal control plane and backend API foundation first.
   * Preserve mobile applications (`customer`, `vendor`, `rider`) in `apps/` for subsequent phases without modifying their UI prematurely.

## Consequences
* **Positive**:
  * 100% type safety from database models to frontend components.
  * Eliminates schema drift and contract mismatches across all 4 applications.
  * Centralized audit trail and uniform security policies.
* **Trade-offs**:
  * Requires local PostgreSQL and Redis services to execute full live API integration tests.
