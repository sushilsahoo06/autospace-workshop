# Project Memory & Architectural Decision Records (ADRs)

---

## 1. Project Context & Identity

* **Project Name**: Autospace Workshop
* **Repository Origin**: Cloned and transferred to personal namespace:
  - **Remote URL**: `https://github.com/sushilsahoo06/autospace-workshop.git`
  - **Author**: Sushil Sahoo (`sushilsahoo06`)
  - **Email**: `sahoosushil456@gmail.com`
* **Purpose**: Next-generation smart parking reservation and valet management platform featuring 3D slot visualization, geospatial routing, and Agentic AI automation.

---

## 2. Port & Service Matrix

| Service / App | Directory | Runtime Port | Protocol / Entrypoint |
|---|---|---|---|
| **NestJS Backend API** | `apps/api` | `3000` | REST `/` (Swagger) & GraphQL `/graphql` |
| **Customer Web App** | `apps/web` | `3001` | HTTPS/HTTP Next.js App |
| **Garage Manager App** | `apps/web-manager` | `3002` | HTTPS/HTTP Next.js App |
| **Valet Attendant App** | `apps/web-valet` | `3003` | HTTPS/HTTP Next.js App |
| **Super Admin App** | `apps/web-admin` | `3004` | HTTPS/HTTP Next.js App |
| **PostgreSQL Database** | Root `docker-compose.yml` | `2010` (mapped to `5432`) | PostgreSQL 16 Wire Protocol |
| **Live Server Console** | Root `index.html` | `5500` | Local static architecture dashboard |

---

## 3. Architectural Decision Records (ADRs)

### ADR-001: Monorepo Tooling via Nx & Yarn Workspaces
* **Context**: Need to maintain 4 distinct frontend portals, a unified backend API, and 5 shared libraries without duplicating types, forms, or network clients.
* **Decision**: Adopted Yarn Workspaces combined with Nx 18 build orchestration.
* **Consequence**: Shared code lives in `libs/*` and builds incrementally; client bundles never duplicate UI components or GraphQL query types.

### ADR-002: Dual-Gateway API (Code-First Apollo GraphQL + Swagger REST)
* **Context**: Frontends require flexible data fetching (fetching garages with nested slot and address details without overfetching), but third-party services like Stripe require standard REST endpoints for webhooks and health checks.
* **Decision**: Deployed NestJS with Apollo Driver using **code-first schema generation** (`src/schema.gql`), while maintaining REST controllers decorated with Swagger OpenAPI on root (`/`).
* **Consequence**: Full type safety from Prisma through GraphQL to client-side Apollo TypedDocumentNodes via `@graphql-codegen`.

### ADR-003: 3D Spatial Slot Visualizer via Three.js & React Three Fiber
* **Context**: Flat 2D slot dropdowns fail to communicate multi-level garage layouts, slot clearances, column obstructions, or proximity to elevators.
* **Decision**: Developed `@autospace/3d` using Three.js and `@react-three/fiber`.
* **Consequence**: Drivers can inspect the exact physical spot, rotate cameras, and select stalls interactively in real time.

### ADR-004: Offloaded Payment Handling via Stripe Checkout
* **Context**: Storing or passing raw credit card numbers on backend servers incurs heavy PCI-DSS compliance audits.
* **Decision**: Implemented Stripe Checkout Sessions (`@stripe/stripe-node`).
* **Consequence**: Drivers complete payments on Stripe-hosted checkout pages. Backend listens for `/stripe/success` and webhook callbacks to confirm reservations.

### ADR-005: Shared Authentication via NextAuth & JWT Module
* **Context**: Users authenticate via either Google OAuth 2.0 or Email/Password credentials and need to access role-restricted portals.
* **Decision**: NextAuth configured in `@autospace/network` with a shared `JWT_SECRET`.
* **Consequence**: NextAuth mints and validates JWTs carrying user role claims (`Customer`, `Manager`, `Valet`, `Admin`), which are verified by NestJS `JwtGuard`.

---

## 4. Environment Variables Reference Cheatsheet

### 4.1 Backend API (`apps/api/.env`)
```bash
# Database connection string (Port 2010 when running via local Docker Compose)
DATABASE_URL="postgresql://postgres:password@localhost:2010/postgres"

# JWT Secret (MUST match NEXTAUTH_SECRET on frontends)
JWT_SECRET="autospace_jwt_shared_secret_key_2024"

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_SUCCESS_URL="http://localhost:3000/stripe/success?session_id={CHECKOUT_SESSION_ID}"
STRIPE_CANCEL_URL="http://localhost:3001/booking-failed"
BOOKINGS_REDIRECT_URL="http://localhost:3001/bookings"
```

### 4.2 Customer Web Portal (`apps/web/.env`)
```bash
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="autospace_jwt_shared_secret_key_2024"

# Mapbox Token for map tiles, geocoding, and routing
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1_your_mapbox_public_token_here"

# Stripe Publishable Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 5. Known Gotchas & Troubleshooting Guide

1. **Docker PostgreSQL Port (2010 vs 5432)**:
   - In `docker-compose.yml`, the host port is mapped to `2010:5432`.
   - Your local `DATABASE_URL` must point to `localhost:2010`, **not** `5432` (which is often taken by local Windows PostgreSQL services).
2. **NestJS Nohoist Dependencies**:
   - Do not remove the `nohoist` block in root `package.json`. It prevents `@nestjs` modules from being hoisted to the root `node_modules`, which breaks NestJS reflection metadata.
3. **GraphQL Schema Sync**:
   - If GraphQL mutations fail with missing fields, run `yarn entity:complete` in `apps/api` followed by `yarn codegen` in `libs/network` to ensure schema parity.
4. **JWT Secret Parity**:
   - If the backend returns `401 Unauthorized` on client GraphQL requests, ensure `JWT_SECRET` in `apps/api/.env` exactly matches `NEXTAUTH_SECRET` in `apps/web/.env`.
