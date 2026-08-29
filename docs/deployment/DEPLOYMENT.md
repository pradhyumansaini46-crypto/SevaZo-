# Sevazo Platform Deployment & Infrastructure Guide

## 1. Local Development Setup

### Prerequisites
* Node.js v24 LTS
* Docker & Docker Compose (or local PostgreSQL 16 & Redis 7)
* npm v10+

### Step-by-Step Local Initialization

1. **Clone & Setup Monorepo**:
   ```bash
   cd Sevaa1
   cp .env.example .env.development
   ```

2. **Start Infrastructure Services**:
   ```bash
   docker-compose up -d
   ```

3. **Install Dependencies & Generate Database Client**:
   ```bash
   npm install
   npm run prisma:generate
   ```

4. **Run Database Migrations & Seed Default Super Admin**:
   ```bash
   npm run prisma:migrate
   npm run seed --workspace=apps/api
   ```
   *Default Admin Login*: `admin@sevazo.com` / `Admin@123456`

5. **Start Development Services**:
   ```bash
   # Terminal 1: Start Central API (Port 4000)
   npm run dev:api

   # Terminal 2: Start Admin Portal (Port 3000)
   npm run dev:admin
   ```

---

## 2. Docker Production Deployment

### Building Container Images

* **Backend API (`apps/api`)**:
  ```dockerfile
  FROM node:24-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  COPY apps/api/package*.json ./apps/api/
  COPY packages/ ./packages/
  RUN npm ci
  RUN npm run build --workspace=apps/api

  FROM node:24-alpine AS runner
  WORKDIR /app
  ENV NODE_ENV=production
  COPY --from=builder /app/apps/api/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  EXPOSE 4000
  CMD ["node", "dist/src/main"]
  ```

* **Admin Portal (`apps/admin`)**:
  ```dockerfile
  FROM node:24-alpine AS builder
  WORKDIR /app
  COPY . .
  RUN npm ci
  RUN npm run build --workspace=apps/admin

  FROM node:24-alpine AS runner
  WORKDIR /app
  ENV NODE_ENV=production
  COPY --from=builder /app/apps/admin/.next/standalone ./
  COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
  COPY --from=builder /app/apps/admin/public ./apps/admin/public
  EXPOSE 3000
  CMD ["node", "apps/admin/server.js"]
  ```

---

## 3. Environment Variable Checklist

| Variable | Environment | Required | Description |
|---|---|:---:|---|
| `PORT` | All | Yes | API listen port (default: 4000) |
| `API_PREFIX` | All | Yes | Versioned route prefix (default: `api/v1`) |
| `DATABASE_URL` | All | Yes | PostgreSQL connection string |
| `REDIS_HOST` | All | Yes | Redis cache hostname (default: `localhost`) |
| `REDIS_PORT` | All | Yes | Redis port (default: 6379) |
| `JWT_SECRET` | Production | Yes | Cryptographic secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Production | Yes | Cryptographic secret for signing refresh tokens |
| `NEXT_PUBLIC_API_URL` | Admin | Yes | API URL accessible by browser clients |
