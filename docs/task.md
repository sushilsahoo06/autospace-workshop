# Engineering Tasks & Agentic AI Implementation Roadmap

---

## 1. Environment & Baseline Setup

- [x] Configure repository remote to `https://github.com/sushilsahoo06/autospace-workshop.git`
- [x] Set Git author identity (`sushilsahoo06` / `sahoosushil456@gmail.com`)
- [x] Set up local database container in `docker-compose.yml` on port `2010`
- [x] Create comprehensive architectural and product documentation in `docs/`
- [ ] Verify local database connectivity:
  ```bash
  docker-compose up -d
  yarn prisma migrate dev
  yarn prisma db seed
  ```
- [ ] Configure environment variables across all apps from `.env.example`:
  - `apps/api/.env`
  - `apps/web/.env`
  - `apps/web-manager/.env`
  - `apps/web-valet/.env`
  - `apps/web-admin/.env`

---

## 2. Core Platform Enhancements

### 2.1 Customer Booking Experience (`apps/web` :3001)
- [ ] **Address Autocomplete**: Integrate Mapbox Search Box API for instant destination suggestions in search header.
- [ ] **3D Slot Hover Tooltips**: Add interactive floating tags showing slot dimensions, level, and hourly rate when hovering over Three.js slot meshes.
- [ ] **Booking Cancellation Flow**: Implement in-app cancellation before reservation start with automated Stripe refund logic.
- [ ] **Mobile Bottom Sheet**: Enhance mobile responsive layout using a touch-draggable bottom drawer for slot checkout.

### 2.2 Operations & Valet Systems (`apps/web-valet` :3003 & `apps/web-manager` :3002)
- [ ] **Live GPS Location Tracking**: Stream driver and valet location coordinates to Mapbox map during active pickup handoffs.
- [ ] **Digital Vehicle Condition Form**: Allow valet attendants to upload vehicle intake photos to Supabase Storage before parking.
- [ ] **Occupancy Analytics Charts**: Add real-time revenue, occupancy rate, and peak-hour heatmaps in the Manager dashboard.
- [ ] **Batch Slot Creation Wizard**: Multi-level visual form for managers to provision entire garage floors in a single submission.

### 2.3 Backend & Infrastructure (`apps/api` :3000)
- [ ] **Stripe Webhook Verification**: Implement cryptographic signature verification (`stripe.webhooks.constructEvent`) on `/stripe/webhook`.
- [ ] **Token Expiration Refresh**: Add automatic JWT refresh token rotation mechanism in `@autospace/network` NextAuth config.
- [ ] **Rate Limiting Guard**: Add `@nestjs/throttler` across public GraphQL query endpoints to prevent scraping.

---

## 3. Agentic AI Implementations

### 🤖 Agent 1: Autonomous Parking Concierge (Customer Web App)
- [ ] **Phase 1.1**: Install agent dependencies in `apps/api`:
  ```bash
  yarn workspace @autospace/api add @langchain/core @langchain/openai zod
  ```
- [ ] **Phase 1.2**: Author NestJS AI Agent Module (`apps/api/src/models/ai-agent/`):
  - [ ] Implement `ai-agent.service.ts` with LangChain / Vercel AI SDK execution loop.
  - [ ] Implement `ai-agent.controller.ts` providing a streaming endpoint (`POST /ai/chat`).
- [ ] **Phase 1.3**: Implement Deterministic Agent Tools:
  - [ ] `search_available_garages`: Geocoding + radius + temporal availability filter.
  - [ ] `get_slot_specs`: Queries 3D slot clearances (EV, Height, Compact).
  - [ ] `create_stripe_booking_session`: Direct checkout session creation.
- [ ] **Phase 1.4**: Frontend Chat Interface:
  - [ ] Build floating AI Concierge drawer in `apps/web` with real-time text streaming.
  - [ ] Add speech-to-text voice input support using Web Speech API.

### 🧤 Agent 2: Autonomous Valet Dispatch & Dynamic Re-Route Agent
- [ ] **Phase 2.1**: Implement geofence arrival detection hook in `apps/web`:
  - [ ] Triggers WebSocket event when customer is within 5 minutes of garage.
- [ ] **Phase 2.2**: Build Dispatch Optimization Agent in NestJS:
  - [ ] Evaluates active valets by distance, floor assignment, and queue backlog.
  - [ ] Automatically generates and assigns `ValetAssignment` record in PostgreSQL.
- [ ] **Phase 2.3**: Dynamic Bottleneck Reassignment:
  - [ ] Detects valet stall/delay events (> 10 min without status update) and autonomously transfers vehicle retrieval to backup valet.

### 📈 Agent 3: Dynamic Pricing & Yield Optimization Agent
- [ ] **Phase 3.1**: Build Hourly Cron Orchestrator in NestJS (`@nestjs/schedule`):
  - [ ] Analyzes historical occupancy and current booking velocity per garage.
- [ ] **Phase 3.2**: External Demand Ingestion Tool:
  - [ ] Scrapes local municipal events, concert schedules, and weather forecasts.
- [ ] **Phase 3.3**: Automated Pricing Action:
  - [ ] Computes demand elasticity and updates hourly pricing within manager-defined safety caps ($\pm 35\%$).
  - [ ] Sends automated daily yield digest to garage manager email/dashboard.

### ⚖️ Agent 4: Automated Overstay & Dispute Arbitrator
- [ ] **Phase 4.1**: Build Timeline Audit Analyzer:
  - [ ] Compares reservation end time against valet checkout scan timestamp.
- [ ] **Phase 4.2**: Policy Decision Engine:
  - [ ] Grace period ($\le 15\text{ min}$): Auto-waives fees.
  - [ ] Significant overstay ($> 1\text{ hour}$): Computes overtime fee and triggers off-session Stripe charge.
  - [ ] Disputed cancellation: Verifies cancellation timestamp against garage refund policy and invokes `stripe.refunds.create()`.

### 📐 Agent 5: Spatial 3D Parking Layout Architect
- [ ] **Phase 5.1**: Spatial Blueprint Ingestion:
  - [ ] Accepts garage dimensions ($W \times L \times H$, number of levels, ramp positions).
- [ ] **Phase 5.2**: Procedural Mesh Generation:
  - [ ] Algorithmic stall distribution maximizing capacity while preserving turning radiuses.
- [ ] **Phase 5.3**: Seed Integration:
  - [ ] Directly outputs Prisma `Slot` records and Three.js scene geometry JSON for immediate 3D rendering.

---

## 4. Verification & Testing Milestones

- [ ] Run full project compilation check:
  ```bash
  yarn tsc
  ```
- [ ] Run ESLint and Prettier validation:
  ```bash
  yarn lint
  yarn format:check
  ```
- [ ] Run automated unit and integration tests:
  ```bash
  yarn workspace @autospace/api test
  yarn workspace @autospace/api test:e2e
  ```
- [ ] Execute complete monorepo validation pipeline:
  ```bash
  yarn validate
  ```
