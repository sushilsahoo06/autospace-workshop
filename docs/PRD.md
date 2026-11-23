# Product Requirements Document (PRD): Autospace Platform

---

## 1. Document Control & Overview

| Document Version | 1.0.0 |
| :--- | :--- |
| **Product Name** | Autospace |
| **Owner / Lead** | Sushil Sahoo (`sushilsahoo06`) |
| **Repository** | `https://github.com/sushilsahoo06/autospace-workshop.git` |
| **Status** | Active Development |
| **Target Launch** | 2026 Q4 |

---

## 2. Product Vision & Mission

Urban parking is plagued by search latency, unpredictable pricing, blind spot allocation, and fragmented valet operations. 

**Autospace** is an end-to-end, multi-tenant parking reservation and valet management platform that transforms parking from a frustrating obstacle into an automated, predictable, and intelligent experience. By uniting **geospatial search (Mapbox)**, **interactive 3D spatial slot selection (Three.js / React Three Fiber)**, **frictionless payments (Stripe)**, and **real-time valet dispatch**, Autospace creates a single connected ecosystem for drivers, parking operators, and service attendants.

---

## 3. User Personas & Target Audiences

### Persona 1: The Urban Driver / Customer ("Alex")
* **Profile**: Busy professional or event attendee looking for guaranteed parking near their destination.
* **Pain Points**: Circling blocks wasting fuel, unexpected full garages, lack of transparency on garage clearance and amenities (EV charging, security).
* **Goals**: Quickly locate parking, inspect the exact slot in 3D, prepay to lock in a spot, and optionally request valet drop-off and pickup.

### Persona 2: The Garage Owner / Manager ("Marcus")
* **Profile**: Independent or commercial parking operator managing single or multi-level garages.
* **Pain Points**: Static pricing leading to under-utilized inventory during off-peak hours and lost revenue during peak demand, manual paperwork.
* **Goals**: Register companies and garages, configure slot capacities and pricing tiers, track live occupancy, and maximize yield.

### Persona 3: The Valet Attendant ("Elena")
* **Profile**: On-ground service staff executing vehicle intake, parking maneuvers, and return handoffs.
* **Pain Points**: Confusing paper tickets, lack of visibility into vehicle arrival times, disorganized key handovers.
* **Goals**: Receive real-time push dispatches, view digital vehicle intake inspection checklists, and seamlessly log status updates.

### Persona 4: Platform Administrator ("Admin")
* **Profile**: Platform operations lead ensuring platform integrity and safety.
* **Pain Points**: Fraudulent garage registrations, disputed overstay charges, unverified operator listings.
* **Goals**: Review and verify garage submissions, audit booking timelines, monitor transactions, and enforce platform standards.

---

## 4. User Journeys

### 4.1 Driver Reservation Journey
```
[Driver enters destination] 
       │ 
       ▼
[Mapbox geocodes location & renders nearby garage pins]
       │
       ▼
[Driver inspects Garage details & launches 3D Spatial Lot]
       │
       ▼
[Selects specific slot (e.g. EV-charging / Level 2 / Stall A-14)]
       │
       ▼
[NextAuth Session validated -> Apollo GraphQL mutation CreateBooking]
       │
       ▼
[Redirected to Stripe Checkout -> Completes card payment]
       │
       ▼
[Redirected to /bookings -> Receives QR pass & valet check-in code]
```

### 4.2 Valet Intake & Return Journey
```
[Customer arrives within geofenced pickup perimeter]
       │
       ▼
[Valet receives dispatch notification in apps/web-valet (:3003)]
       │
       ▼
[Valet scans QR code / verifies vehicle license plate]
       │
       ▼
[Valet maneuvers vehicle into assigned 3D slot -> Marks 'PARKED']
       │
       ▼
[Customer requests return via apps/web -> Valet delivers vehicle]
       │
       ▼
[Customer scans exit pass -> Booking marked 'COMPLETED']
```

---

## 5. Functional Requirements

### 5.1 Customer Web Application (`apps/web` :3001)
* **FR-101 Location & Geocoding**: Search destinations using Mapbox GL Places API; render interactive map pins with hourly price tags.
* **FR-102 Real-time Inventory**: Query live slot availability filtered by vehicle height, EV charging, and date/time range.
* **FR-103 3D Garage Viewer**: Interactive Three.js / React Three Fiber canvas rendering multi-level garage structures with clickable slot meshes.
* **FR-104 Authentication**: NextAuth authentication supporting Google OAuth 2.0 and Email/Password with bcrypt hashing.
* **FR-105 Payment Gateway**: Seamless integration with Stripe Checkout; handles success redirects, cancel fallbacks, and webhook reconciliations.
* **FR-106 My Bookings**: View active, upcoming, and past reservations with live status timeline tracking.

### 5.2 Manager Application (`apps/web-manager` :3002)
* **FR-201 Company & Garage Onboarding**: Register operating company profiles, upload garage images, and assign geographic addresses.
* **FR-202 Slot Management**: Bulk create, update, and configure slot dimensions, levels, and special tags (EV, Disabled, Compact).
* **FR-203 Pricing Engine**: Configure base hourly pricing, weekend modifiers, and special event surcharges.
* **FR-204 Live Occupancy Dashboard**: Visual real-time metric cards displaying occupied, reserved, and open slots.

### 5.3 Valet Application (`apps/web-valet` :3003)
* **FR-301 Digital Dispatch Queue**: Instant feed of pickup and return assignments with customer ETA countdowns.
* **FR-302 Vehicle Intake**: Digital check-in recording vehicle license plate ID, initial mileage, and inspection photos.
* **FR-303 Slot Assignment**: Guided navigation to designated physical parking spots inside the garage.
* **FR-304 Return Workflow**: Notification of customer arrival, vehicle retrieval confirmation, and handoff completion.

### 5.4 Super Admin Application (`apps/web-admin` :3004)
* **FR-401 Garage Verification**: Review submitted garage documents and geographic authenticity; approve or reject verification requests.
* **FR-402 User & Role Governance**: Manage role permissions (`Admin`, `Manager`, `Valet`, `Customer`) and audit access logs.
* **FR-403 Transaction Audit**: Query all Stripe transactions, booking timelines, and revenue distributions.

### 5.5 Backend API (`apps/api` :3000)
* **FR-501 Code-First GraphQL**: Apollo Server providing auto-generated schemas (`src/schema.gql`) and typed resolvers.
* **FR-502 REST & Webhook Handlers**: OpenAPI/Swagger documented endpoints for Stripe webhooks and payment redirect callbacks.
* **FR-503 Role-Based Security**: Custom JWT guards validating claims before resolver execution.
* **FR-504 Prisma ORM**: Strongly typed database client managing 14 relational models on PostgreSQL 16.

---

## 6. Non-Functional Requirements

### 6.1 Performance & Latency
* **NFR-101 API Response Time**: 95% of GraphQL queries must resolve in $< 120\text{ms}$.
* **NFR-102 3D Canvas Rendering**: Three.js canvas must render at $\ge 60\text{ fps}$ on modern desktop and mobile browsers.
* **NFR-103 Map Tile Loading**: Mapbox tiles must reach interactive state within $< 1.5\text{s}$ under typical 4G connections.

### 6.2 Security & Compliance
* **NFR-201 PCI Compliance**: No raw credit card data or CVV numbers stored on backend servers; 100% offloaded to Stripe.
* **NFR-202 Password Security**: All credentials hashed with `bcryptjs` using minimum salt factor of 10.
* **NFR-203 Secret Masking**: Zero secrets in source control; mandatory `.env` segregation and runtime validation.
* **NFR-204 Transport Encryption**: Enforced TLS 1.3 across all client-to-backend and backend-to-database connections.

### 6.3 Scalability & Reliability
* **NFR-301 Database Resilience**: PostgreSQL connection pooling configured with automatic retry logic on transient dropouts.
* **NFR-302 Monorepo Modularity**: Shared libraries (`@autospace/ui`, `@autospace/network`, `@autospace/3d`) isolated with Nx dependency boundaries to prevent circular imports.

---

## 7. Key Performance Indicators & Success Metrics

1. **Booking Completion Rate**: $\ge 85\%$ of drivers who select a slot proceed through payment.
2. **Search-to-Reservation Time**: Reduce driver search and booking time to $< 90\text{ seconds}$.
3. **Valet Turnaround Time**: Average vehicle pickup and return latency under $8\text{ minutes}$.
4. **Garage Yield Uplift**: Achieve a $15\% - 30\%$ increase in revenue for managers using intelligent slot scheduling.
