# Sevazo Platform: Antigravity Integrations & Tooling Architecture

This document defines the formal integration architecture between the **Antigravity AI Agentic System** and the **Sevazo Multi-Sided Platform Monorepo**.

```
                    ANTIGRAVITY
                         │
          ┌──────────────┼───────────────┐
          │              │               │
       Plugins          MCP            Skills
          │              │               │
          │       ┌──────┼────────┐      │
          │       │      │        │      │
       Web      GitHub Prisma   Redis   Security
      Guidance  Postman Maps   Stripe   Architecture
          │       Figma Chrome Firebase Testing
          │
          └──────────────┬────────────────┘
                         ↓
                  SEVAZO MONOREPO
                         ↓
        ┌────────┬───────┼────────┬────────┐
        ↓        ↓       ↓        ↓        ↓
    Customer   Vendor   Rider    Admin    Backend
        └────────┴───────┼────────┴────────┘
                         ↓
                    PostgreSQL
                         +
                       Redis
                         +
                 External Services
```

---

## 1. Integration Inventory & Staged Activation Policy

Integrations are governed by the strict principle: **"Never install everything blindly; activate strictly on feature milestones to minimize context clutter, token overhead, and unauthorized side-effects."**

### Tier P0: Core Development (Active Now)
1. **Modern Web Guidance** (Plugin):
   - Scope: Admin Portal & responsive web client layouts, accessibility compliance (WCAG), Core Web Vitals.
   - Permissions: Read-only best practices.
   - Location: `~/.gemini/config/plugins/modern-web-guidance-plugin`.
2. **GitHub** (MCP):
   - Scope: Source-of-truth for code branches, pull requests, issue tracking, and versioning.
   - Permissions: Least-privilege Personal Access Token (`repo` scope only).
   - Server: `@modelcontextprotocol/server-github`.
3. **Prisma & PostgreSQL** (MCP):
   - Scope: Relational schema introspection across 54 domain models, migration verification, and table relationship mapping.
   - Permissions: Local PostgreSQL credentials (`sevazo_db`). Raw destructive SQL (`DROP`, `TRUNCATE`) strictly restricted to interactive approval mode.
   - Servers: `prisma mcp` and `@modelcontextprotocol/server-postgres`.
4. **Redis** (MCP):
   - Scope: Ephemeral state inspection: OTP expiry, rider online status, cart locks, and BullMQ background queue introspection.
   - Permissions: Local Redis connection (`redis://localhost:6379`). `FLUSHALL` restricted.
   - Server: `@modelcontextprotocol/server-redis`.
5. **Postman** (MCP):
   - Scope: REST API testing, OpenAPI specification synchronization, and contract testing across 14 backend domain modules.
   - Server: `@postman/postman-mcp-server`.
6. **Chrome DevTools** (Plugin):
   - Scope: Browser automation, network profiling, memory leak detection, and CSS debugging for the Admin Portal.
   - Location: `~/.gemini/config/plugins/chrome-devtools-plugin`.
7. **Figma Dev Mode** (MCP):
   - Scope: Design-to-code translation, design tokens, spacing, typography, and component specifications.
   - Server: Desktop Dev Mode Bridge (`http://127.0.0.1:3845/mcp`) + `figma-developer-mcp`.

---

### Tier P1: Business & Operational Integrations (Staged Activation)
8. **Google Maps Platform** (Plugin):
   - Scope: Geocoding, reverse geocoding, store/rider coordinates, distance matrix, and delivery routing ETA.
   - Status: Active in plugins; ready for logistics implementation.
9. **Stripe** (MCP):
   - Scope: Server-side payment intents, refund workflows, and webhook event verification.
   - Status: Staged for Phase 6 (Payments & Settlements milestone).
10. **Firebase / FCM** (Plugin / MCP):
    - Scope: Firebase Cloud Messaging for mobile push notifications and crash reporting.
    - Status: Quarantined in `~/.gemini/disabled_plugins/` until push notification milestone.
11. **Linear** (MCP):
    - Scope: Project ticket backlog, sprint task lifecycle (`SEV-001` through `SEV-020`).
    - Status: Staged for team scale-up.

---

### Tier P2: Quality, Telemetry & Multi-Step Reasoning
12. **Sequential Thinking** (MCP):
    - Scope: Dynamic algorithmic hypothesis validation for complex multi-party state transitions (*Order → Payment → Vendor Prep → Rider Assignment → Delivery → Settlement*).
    - Status: Active in `mcp_config.json` (`@modelcontextprotocol/server-sequential-thinking`). Requires zero external keys.
13. **SonarQube** (MCP):
    - Scope: Static code analysis, vulnerability scanning, and maintainability gating.
    - Status: Staged for pre-production hardening.
14. **PostHog** (MCP):
    - Scope: Product analytics, user funnels, cart abandonment telemetry.
    - Status: Staged for customer analytics milestone.

---

## 2. Configuration File Locations

- **Global MCP Configuration**: `~/.gemini/config/mcp_config.json`
- **Global Plugin Registry**: `~/.gemini/config/config.json`
- **Plugin Filesystem**: `~/.gemini/config/plugins/`
- **Quarantined Plugins**: `~/.gemini/disabled_plugins/`
- **Platform Architecture Docs**: `Sevaa1/docs/architecture/INTEGRATIONS.md`

---

## 3. Health Check & Error Resolution Matrix

| Component | Target Integration | Health Check Status | Root Cause & Resolution |
|---|---|---|---|
| **GitHub** | `@modelcontextprotocol/server-github` | 🟢 **Healthy (Active)** | Working with 26 tools enabled. |
| **PostgreSQL** | `@modelcontextprotocol/server-postgres` | 🟢 **Healthy (Active)** | Working with query tool enabled. |
| **Sequential Thinking** | `@modelcontextprotocol/server-sequential-thinking` | 🟢 **Healthy (Active)** | Resolved missing `zod` module; running cleanly on stdio. |
| **Prisma** | `prisma mcp` | 🚫 **Removed (Redundant)** | `prisma mcp` is not a valid Prisma CLI command. Database introspection is natively handled by the active `postgres` MCP server. |
| **Postman** | `@postman/postman-mcp-server` | ⏸️ **Staged (Awaiting Key)** | Fails without `POSTMAN_API_KEY`. Enable once key is supplied. |
| **Figma Dev Mode** | `figma-developer` & `:3845` | ⏸️ **Staged (Awaiting Key/App)** | Enable once Figma Desktop Dev Mode is opened (`Shift + D`) or API key is provided. |
| **Redis** | `@modelcontextprotocol/server-redis` | ⏸️ **Staged (Awaiting Service)** | Enable once Redis daemon is running on port 6379. |
| **Chrome DevTools** | `chrome-devtools-plugin` | 🟢 **Healthy (Active)** | Active in Antigravity plugin registry. |
| **Google Maps** | `google_maps_platform` | 🟢 **Healthy (Active)** | Active in Antigravity plugin registry. |

---

## 4. Staged MCP Activation Snippets

Add to `~/.gemini/config/mcp_config.json` when prerequisites are ready:

### To Enable Postman (When API Key is Available):
```json
"postman": {
  "command": "npx",
  "args": ["-y", "@postman/postman-mcp-server@latest", "--full"],
  "env": {
    "POSTMAN_API_KEY": "<your-postman-api-key>"
  }
}
```

### To Enable Figma (When Desktop Dev Mode is Open):
```json
"figma-desktop": {
  "serverUrl": "http://127.0.0.1:3845/mcp"
}
```

### To Enable Redis (When Redis Server is Running):
```json
"redis": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-redis", "redis://localhost:6379"]
}
```

---

## 4. Safety & Security Gating Rules

1. **No Hardcoded Secrets**: No API keys, JWT secrets, or tokens committed to source control. All secrets reside in local `.env` files.
2. **Approval Mode for Destructive Operations**: Operations involving `DROP TABLE`, `TRUNCATE`, `git push --force`, or bucket deletions require explicit user confirmation.
3. **Backend Authoritative Rule**: Mobile apps and web frontends are never trusted for payment confirmation, order status, or approval states. The central NestJS backend with PostgreSQL transactions remains the sole source of truth.
