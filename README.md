# 🚗 AutoSpace — Enterprise Intelligent Smart Parking & Spatial Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-13_App_Router-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-GraphQL_Code--First-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.0+-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Spatial_Canvas-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Mapbox GL](https://img.shields.io/badge/Mapbox-Dark_V11-000000?logo=mapbox&logoColor=white)](https://www.mapbox.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment_Intents-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Nx Monorepo](https://img.shields.io/badge/Nx-Integrated_Workspace-143055?logo=nx&logoColor=white)](https://nx.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **AutoSpace** is a full-stack, enterprise-grade spatial parking and mobility ecosystem designed to orchestrate complex urban parking logistics in real time. Built inside a high-velocity **Nx Monorepo**, AutoSpace bridges 3D WebGL spatial visualization, Apollo GraphQL code-first microservices, real-time valet logistics, and multi-tenant garage administration with dynamic pricing and agentic AI automation.

---

## 📑 Table of Contents
1. [System Architecture](#-system-architecture)
2. [Monorepo Workspace Structure](#-monorepo-workspace-structure)
3. [Key Feature Highlights](#-key-feature-highlights)
4. [Agentic AI Architecture](#-agentic-ai-architecture)
5. [Tech Stack Matrix](#-tech-stack-matrix)
6. [Interactive Live Architecture Console](#-interactive-live-architecture-console)
7. [Getting Started Locally](#-getting-started-locally)
8. [Comprehensive Documentation Index](#-comprehensive-documentation-index)
9. [Interview & Engineering Master Guide](#-interview--engineering-master-guide)
10. [Author & License](#-author--license)

---

## 🏛 System Architecture

AutoSpace separates client presentation, state management, edge gateway routing, and transactional persistence into decoupled layers:

```mermaid
flowchart TD
    subgraph ClientLayer["🖥️ Frontend Clients (Next.js 13 App Router / React)"]
        WEB["apps/web<br/>(Customer Discovery & Booking)"]
        ADMIN["apps/web-admin<br/>(Garage Owners & SuperAdmin)"]
        VALET["apps/web-valet<br/>(Valet Driver Logistics PWA)"]
    end

    subgraph APILayer["⚡ Core Backend (NestJS Code-First GraphQL)"]
        APIGW["NestJS Apollo GraphQL Gateway<br/>(Port :3000)"]
        AUTH["Auth Module (NextAuth / JWT / RBAC)"]
        GARAGE["Garage & Spatial Slot Engine"]
        BOOKING["Booking & Reservation Manager"]
        VALET_SVC["Valet Dispatch & Pickup Queue"]
    end

    subgraph DataLayer["🗄️ Persistence & Spatial Stores"]
        POSTGRES[("PostgreSQL 15 (Docker :2010)<br/>ACID Transactions")]
        PRISMA["Prisma ORM Client<br/>(14 Domain Models)"]
    end

    subgraph ExternalServices["🌐 External Third-Party Integrations"]
        MAPBOX["Mapbox GL SDK<br/>(Geocoding & Dark v11 Tiles)"]
        STRIPE["Stripe Payments API<br/>(PaymentIntents & Webhooks)"]
        CLOUDINARY["Cloudinary CDN<br/>(Garage & Vehicle Assets)"]
    end

    WEB -->|GraphQL Queries / Mutations| APIGW
    ADMIN -->|GraphQL Management API| APIGW
    VALET -->|Live Status Mutations| APIGW

    APIGW --> AUTH
    APIGW --> GARAGE
    APIGW --> BOOKING
    APIGW --> VALET_SVC

    GARAGE --> PRISMA
    BOOKING --> PRISMA
    VALET_SVC --> PRISMA
    PRISMA --> POSTGRES

    WEB -.->|Vector Map Tiles| MAPBOX
    BOOKING -.->|Payment Hold / Capture| STRIPE
    GARAGE -.->|CDN Image Delivery| CLOUDINARY
```

---

## 📁 Monorepo Workspace Structure

Powered by **Nx**, AutoSpace enforces rigorous boundary isolation between deployable applications (`apps/`) and reusable cross-platform domain libraries (`libs/`):

```
autospace-workshop/
├── apps/
│   ├── api/                     # NestJS Code-First GraphQL Backend Server
│   │   ├── prisma/              # Schema (14 models), Migrations & Seed data
│   │   └── src/models/          # Resolvers, Services, DTOs (Garages, Bookings, Valets)
│   ├── web/                     # Customer Portal (Mapbox search, 3D slot selection, Stripe)
│   ├── web-admin/               # Manager & SuperAdmin Dashboard (Analytics, Pricing, Slots)
│   └── web-valet/               # Valet Attendant Real-Time Logistics Mobile App
├── libs/
│   ├── network/                 # Shared GraphQL Apollo Clients, Codegen hooks, Auth options
│   ├── ui/                      # "Precision Mobility" Design System, Shared Atoms/Molecules
│   ├── forms/                   # React Hook Form + Zod validation schemas
│   └── util/                    # Common date math, spatial utilities, formatters
├── architecture/                # Self-contained visual architecture diagrams (Archify)
│   ├── runtime-architecture.html# High-level full system architecture diagram
│   ├── runtime-sequence.html    # Interactive 8-step request lifecycle sequence diagram
│   ├── runtime-core.html        # 10-Component core architecture with trust boundaries
│   └── core-architecture.md     # Architectural design tokens and component specs
├── docs/                        # Complete Engineering & Product Documentation
│   ├── PRD.md                   # Product Requirements Document (4 Personas, 18 FRs, NFRs)
│   ├── architecture.md          # Comprehensive System Architecture & Database ERD
│   ├── rules.md                 # Engineering Conventions, Git Flow & Security Rules
│   ├── design.md                # Precision Mobility Design System & Three.js Canvas Specs
│   ├── task.md                  # Development Roadmap & 5 Agentic AI Implementations
│   ├── project-memory.md        # Architecture Decision Records (ADRs) & Env Matrix
│   └── interview-guide.md       # Technical Interview Master Guide (Q&As & STAR Framework)
├── docker-compose.yml           # PostgreSQL 15 containerized service (Host :2010 -> :5432)
├── index.html                   # Interactive Live Architecture & Flow Simulator Console
└── package.json                 # Monorepo root scripts and dependencies
```

---

## ✨ Key Feature Highlights

### 1. Interactive 3D Spatial Slot Selection (`Three.js`)
- Real-time 3D parking garage spatial rendering.
- Interactive slot status coloring: **Available** (Emerald), **Reserved** (Amber), **Occupied** (Crimson), **Maintenance** (Slate).
- Dynamic camera pan and collision-tested hover states for effortless slot selection.

### 2. High-Precision Geospatial Discovery (`Mapbox GL`)
- Real-time radius queries with Mapbox Dark v11 vector styling.
- Interactive pin clustering, price popups, and garage amenity filtering (EV Charging, Covered, Valet, Security).

### 3. Valet Operations & Real-Time Logistics Queue
- Valet attendant assignment with end-to-end status tracking: `ASSIGNED` ➔ `PICKED_UP` ➔ `PARKED` ➔ `REQUESTED` ➔ `RETURNED`.
- Verification code authorization preventing unauthorized vehicle release.

### 4. Enterprise-Grade Multi-Tenant RBAC
- Role-Based Access Control enforcing strict tenant separation across 4 distinct roles: `USER`, `MANAGER`, `VALET`, and `ADMIN`.
- NextAuth.js JWT token lifecycle coupled with NestJS `@UseGuards(GqlAuthGuard)` and `@Roles()` decorators.

### 5. Seamless Financial Processing (`Stripe SDK`)
- Secure client-side Stripe Elements integration for two-stage reservation flows: pre-authorization hold at booking time, final capture upon garage exit.

---

## 🤖 Agentic AI Architecture

AutoSpace features an extensible Agentic AI layer designed to transform static parking garages into autonomous mobility hubs:

| Autonomous Agent | Core Function | Algorithmic Trigger | Target Metric |
| :--- | :--- | :--- | :--- |
| **Dynamic Pricing Agent** | Continuous price elasticity adjustment | Multi-factor: Occupancy velocity + Local weather + City event calendar | **+28% RevPAR** |
| **Spatial Allocation Agent** | Optimizes vehicle-to-slot assignments | Vehicle dimensions, EV charger proximity, dwell time | **-40% Garage Congestion** |
| **Valet Dispatch Agent** | Autonomous queue dispatching | Customer GPS ETA + Driver proximity + Traffic telemetry | **< 3 min Retrieval Time** |
| **Vision Gate Agent** | Frictionless barrier control | Automated License Plate Recognition (ALPR) via edge cameras | **Zero-touch Check-in** |
| **Predictive Maintenance Agent**| Gate motor & sensor anomaly detection | Sensor duty cycles + Vibration telemetry | **99.9% Hardware Uptime** |

*For complete implementation specs, tool signatures, and prompt manifests, see [`docs/task.md`](file:///docs/task.md).*

---

## 💻 Tech Stack Matrix

| Layer | Technologies |
| :--- | :--- |
| **Monorepo Engine** | Nx Workspace, Yarn Workspaces |
| **Frontend Frameworks** | Next.js 13 (App Router), React 18, TailwindCSS |
| **3D & Spatial Visualization** | Three.js, React Three Fiber, Mapbox GL JS |
| **Backend Framework** | NestJS 9+, Apollo Server 4, GraphQL Code-First |
| **Persistence & Database** | PostgreSQL 15, Prisma ORM (14 Domain Entities) |
| **Authentication & RBAC** | NextAuth.js, JWT Tokens, Bcrypt, NestJS ExecutionContext Guards |
| **Payments & Billing** | Stripe API, Stripe Elements, Webhook Listeners |
| **Cloud Assets & CDN** | Cloudinary CDN |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Interactive Live Architecture Console

This repository includes a standalone, self-hosted **Live Architecture & Request Flow Simulator Console**.

To view the live animated runtime packet simulator and interactive diagrams:
1. Open the project in VS Code.
2. Right-click [`index.html`](file:///index.html) and select **Open with Live Server** (or open `http://127.0.0.1:5500`).
3. Experience:
   - **Tab 1 — Live Runtime Flow Simulator**: Interactive packet animation from Next.js ➔ NestJS Apollo ➔ Prisma ORM ➔ PostgreSQL with real-time logs and latency metrics.
   - **Tab 2 — Core Architecture Diagram**: 10-Component trust-boundary interactive canvas.
   - **Tab 3 — Sequence Flow Diagram**: Comprehensive 8-stage synchronous & asynchronous reservation sequence.

---

## 🛠️ Getting Started Locally

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` LTS
- **Yarn**: `v1.22+`
- **Docker & Docker Compose**: Installed and running

### 1. Clone the Repository
```bash
git clone https://github.com/sushilsahoo06/autospace-workshop.git
cd autospace-workshop
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Configure Environment Variables
Copy the template files across the root and applications:
```bash
cp .env.example .env
```
Ensure your database connection string points to your Docker port (`2010`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:2010/autospace?schema=public"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1_your_mapbox_token"
```

### 4. Start Containerized PostgreSQL Database
```bash
docker-compose up -d
```
*Verify container status with `docker ps`. PostgreSQL is exposed on port `2010`.*

### 5. Execute Prisma Migrations & Seed Data
```bash
# Push Prisma schema to PostgreSQL
yarn prisma db push

# (Optional) Seed 20+ realistic garages, slots, users, and valets
yarn prisma db seed
```

### 6. Launch Applications
Run the microservices concurrently or individually:

```bash
# Start NestJS GraphQL Backend API (Runs on http://localhost:3000/graphql)
yarn nx serve api

# Start Customer Web Application (Runs on http://localhost:3001)
yarn nx serve web

# Start Manager & Admin Dashboard (Runs on http://localhost:3002)
yarn nx serve web-admin

# Start Valet Attendant Mobile Web App (Runs on http://localhost:3003)
yarn nx serve web-valet
```

---

## 📚 Comprehensive Documentation Index

Explore the deep architectural blueprints, design tokens, and engineering standards located in [`docs/`](file:///docs/):

- 📄 [**Product Requirements Document (PRD)**](file:///docs/PRD.md): 4 Target user personas, customer journeys, 18 Functional Requirements, and KPI metrics.
- 📐 [**System Architecture Document**](file:///docs/architecture.md): Monorepo dependency graph, GraphQL schema design, 14-table Prisma ERD, and deployment topology.
- 🛡️ [**Engineering Rules & Standards**](file:///docs/rules.md): Nx boundary linting rules, Prisma migration safeguards, Git commit conventions, and Zero-Trust security.
- 🎨 [**Design System Specification**](file:///docs/design.md): "Precision Mobility" design tokens, typography, component hierarchies, and Three.js 3D spatial canvas standards.
- 📋 [**Implementation Tasks & Agentic AI Roadmap**](file:///docs/task.md): End-to-end feature delivery checklist and the 5 autonomous Agentic AI implementations.
- 🚢 [**Deployment Master Guide**](file:///docs/deployment.md): Production deployment routes covering Vercel, Railway, Render, Docker Compose VPS, and AWS ECS.
- 🧠 [**Project Memory & ADRs**](file:///docs/project-memory.md): Architecture Decision Records (ADR 001–006), service port matrices, and troubleshooting guides.
- 🎯 [**Technical Interview Preparation Master Guide**](file:///docs/interview-guide.md): 30s & 2min elevator pitches, 15 deep-dive technical interview Q&As, STAR stories, and salary negotiation blueprints.

---

## 🎯 Interview & Engineering Master Guide

For a comprehensive interview prep breakdown containing exact answers, architectural tradeoffs, and behavioral STAR stories, refer directly to [`docs/interview-guide.md`](file:///docs/interview-guide.md).

### Quick Talking Points for Technical Interviews:
1. **Why an Nx Monorepo?** Solved duplicate DTOs and type drift between NestJS backend and Next.js frontend by establishing a shared `@autospace/network` library with auto-generated Apollo GraphQL hooks.
2. **Handling Double Bookings:** Enforced PostgreSQL row-level locking via Prisma `SELECT ... FOR UPDATE` inside atomic transactions with a unique compound index on `(slotId, startTime, endTime)`.
3. **Optimizing 3D Spatial Rendering:** Replaced heavy polygon models with instanced meshes in Three.js, throttling raycaster calculations to 30 FPS to maintain 60 FPS viewport smoothness on mobile devices.
4. **Resilient Payment Handling:** Integrated Stripe webhooks with idempotency keys, guaranteeing that network timeouts during checkout never trigger duplicate credit card charges.

---

## 👤 Author & License

- **Lead Architect & Developer**: **Sushil Sahoo** ([@sushilsahoo06](https://github.com/sushilsahoo06))
- **Repository**: [https://github.com/sushilsahoo06/autospace-workshop](https://github.com/sushilsahoo06/autospace-workshop)
- **License**: Licensed under the [MIT License](LICENSE).
