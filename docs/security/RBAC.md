# Sevazo Role-Based Access Control (RBAC) Matrix

## 1. Administrative Roles

Sevazo defines 7 administrative tiers based on the principle of least privilege:

1. **`SUPER_ADMIN`**: Full platform authority including RBAC management, API keys, platform fees, and system settings.
2. **`ADMIN`**: Comprehensive management access across commerce, logistics, and users, excluding destructive master settings.
3. **`OPERATIONS_MANAGER`**: Operational supervision over merchants, delivery fleet, catalog approvals, and customer fulfillment.
4. **`CATALOG_MANAGER`**: Taxonomy management, product listings moderation, and inventory auditing.
5. **`FINANCE_MANAGER`**: Payments reconciliation, refund authorization, commission structures, and vendor/rider settlement disbursals.
6. **`LOGISTICS_MANAGER`**: Fleet oversight, dispatch zone boundaries, vehicle verification, and real-time delivery tracking.
7. **`SUPPORT_AGENT`**: Customer and vendor inquiry handling, ticket resolution, and preliminary dispute review.

---

## 2. Granular Permissions Matrix

| Permission Module | Action | `SUPER_ADMIN` | `ADMIN` | `OPERATIONS_MGR` | `CATALOG_MGR` | `FINANCE_MGR` | `LOGISTICS_MGR` | `SUPPORT_AGENT` |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | `dashboard:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin Users** | `admin:manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Roles & Perms**| `roles:manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Customers** | `customers:read` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Customers** | `customers:manage` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Vendors** | `vendors:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Vendors** | `vendors:approve` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Riders** | `riders:read` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Riders** | `riders:approve` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Catalog** | `catalog:read` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Catalog** | `catalog:manage` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Orders** | `orders:read` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Orders** | `orders:manage` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Logistics** | `logistics:read` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Logistics** | `logistics:manage` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Finance** | `finance:read` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Finance** | `finance:manage` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Marketing** | `marketing:manage` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Support** | `support:read` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Support** | `support:manage` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Audit Logs** | `audit:read` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Settings** | `settings:manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Server-Side Enforcement Rules

1. Role and permission tokens are **never trusted from request bodies, query params, or client storage**.
2. Every request is verified server-side against the `admin_users` and `roles` database relations via `@RequirePermissions()` and `PermissionsGuard`.
3. Inactive, suspended, or session-revoked administrators are rejected at the `JwtAuthGuard` stage before hitting any controller logic.
