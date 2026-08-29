# Sevazo Security & Compliance Standards

## 1. Authentication & Session Hygiene

* **Password Hashing**: Passwords are cryptographically salted and hashed using `bcrypt` with a minimum cost factor of 10.
* **Token Rotation**:
  * Access Tokens: Short-lived (15 minutes), signed with `HS256` or `RS256`.
  * Refresh Tokens: Long-lived (7 days), stored hashed in `admin_sessions`. Upon refresh, the previous token is immediately invalidated and a new key pair is issued.
* **MFA (Multi-Factor Authentication)**:
  * Time-based One-Time Password (TOTP) algorithm adhering to RFC 6238 via `otplib`.
  * Mandatory for `SUPER_ADMIN` and `ADMIN` roles before sensitive actions can be performed.
* **Brute-Force & Lockout Mitigation**:
  * Rate-limiting enforced globally via `@nestjs/throttler` (default: 5 failed attempts per 15 minutes).
  * Account status shifts to `SUSPENDED` upon 5 consecutive failed login attempts.

---

## 2. Authorization & IDOR Prevention

* **Server-Side Authority**:
  Frontend permission flags are treated strictly as cosmetic layout hints. The backend guards (`JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`) validate every route.
* **Insecure Direct Object Reference (IDOR) Protection**:
  All queries scope ownership strictly. For example, a vendor querying an order must belong to `order.vendorId`. Administrative endpoints require explicit module permissions.

---

## 3. Data Integrity & Financial Accounting

* **Zero Direct State Mutation**:
  Financial ledgers (`payments`, `refunds`, `settlements`) are immutable append-only logs.
* **Transactional Concurrency**:
  Multi-entity balance updates or inventory reservations execute inside atomic PostgreSQL transactions (`prisma.$transaction`).
* **PCI-DSS Compliance Boundary**:
  Sevazo never captures, transmits, or stores full card numbers, CVVs, or bank credentials. All payment operations rely on tokenized gateway intents (Stripe / Razorpay).

---

## 4. Audit Logging Standards

Every state-mutating HTTP request (`POST`, `PUT`, `PATCH`, `DELETE`) executed by an administrative user triggers an automated write to `audit_logs` capturing:
* `admin_id`: Authenticated admin UUID.
* `action`: Standard action identifier (e.g. `PATCH_VENDORS_KYC`).
* `resource_type`: Affected table or domain entity.
* `resource_id`: Targeted record identifier.
* `old_value`: Pre-mutation snapshot (if applicable).
* `new_value`: Post-mutation parameters.
* `ip_address`: Remote client IP address.
* `user_agent`: Client browser and OS signature.
* `timestamp`: High-precision UTC timestamp.
