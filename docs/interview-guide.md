# Autospace: Comprehensive Technical Interview Master Guide

---

## 1. The 30-Second & 2-Minute Elevator Pitches

### The 30-Second Pitch (Quick Introduction)
> *"Autospace is an enterprise-grade smart parking reservation and valet management platform. It's built as an Nx monorepo orchestrating four Next.js 14 web portals—for customers, garage managers, valet drivers, and super-admins—backed by a modular NestJS API. What makes it unique is that drivers don't just pick from a list; they inspect garages in interactive 3D using Three.js and React Three Fiber, book with Stripe, and get real-time valet routing powered by Mapbox. I also architected an Agentic AI engine for automated conversational concierge booking and dynamic pricing."*

### The 2-Minute Pitch (Deep Architectural Walkthrough)
> *"I built Autospace to solve the friction in urban parking—specifically search latency, slot uncertainty, and chaotic valet handoffs.*
>
> *From an architectural perspective, I wanted an enterprise-ready system, so I chose an **Nx Monorepo with Yarn Workspaces**. This allowed me to build four distinct role-based frontends (`apps/web`, `web-manager`, `web-valet`, `web-admin`) sharing core libraries for UI, forms, and network utilities without duplicating code.*
>
> *On the frontend, the customer app combines **Mapbox GL** for location radius search with a custom **Three.js / React Three Fiber** spatial engine that lets drivers rotate, inspect, and select exact 3D parking stalls across multi-level structures.*
>
> *The backend is built with **NestJS** utilizing a dual-gateway approach: a code-first **Apollo GraphQL API** for flexible client queries with zero over-fetching, alongside standard **OpenAPI REST endpoints** for webhooks and health checks. Data is modeled across 14 relational tables in **PostgreSQL 16** using **Prisma ORM**, ensuring strict ACID transaction guarantees during slot reservations.*
>
> *For security and payments, I integrated **NextAuth.js** with signed JWT role-based guards on the backend, and completely offloaded card transactions to **Stripe Checkout Sessions** to maintain zero-PCI liability.*
>
> *Finally, I designed an **Agentic AI Layer** using LangChain and tool calling that lets drivers book via natural voice or chat, while automating dynamic pricing based on nearby venue events."*

---

## 2. Top Technical Interview Questions & Model Answers

### Category 1: Monorepo & System Architecture

#### Q1: "Why did you choose an Nx Monorepo instead of creating separate repositories for each app?"
* **Direct Answer**:
  > *"Because Autospace consists of four distinct user roles—Customer, Manager, Valet, and Admin—that share significant domain models, UI components, and network contracts.*
  >
  > *If I had used separate repositories (polyrepo), I would have had to publish shared packages to an npm registry or deal with git submodules every time a GraphQL query or DTO changed.*
  >
  > *With Nx and Yarn Workspaces:
  > 1. **Zero Type Duplication**: The GraphQL codegen in `libs/network` automatically outputs typed document nodes that all four Next.js apps consume instantly.
  > 2. **Shared UI & 3D Primitives**: The Tailwind component library in `libs/ui` and the Three.js canvas in `libs/3d` are maintained once and imported across portals.
  > 3. **Computational Caching**: Nx uses affected-graph dependency analysis, meaning during CI/CD it only tests and builds packages that were actually touched."*

#### Q2: "How do you prevent circular dependencies or frontend code leaking into the backend in an Nx monorepo?"
* **Direct Answer**:
  > *"I enforced two levels of boundaries:
  > 1. **Architectural Isolation**: Apps in `apps/*` can never import from peer apps in `apps/*`; they only import from `@autospace/*` libraries in `libs/`.
  > 2. **Nohoist Configuration**: In the root `package.json`, I configured `nohoist` rules for `@nestjs/*` dependencies. This guarantees that backend reflection metadata and decorators are not hoisted or mixed with client-side Next.js bundlers."*

---

### Category 2: Backend, GraphQL & NestJS

#### Q3: "Why did you use NestJS instead of a standard Express.js or Fastify server?"
* **Direct Answer**:
  > *"Express is great for small microservices, but it lacks opinionated architecture. In enterprise systems, Express projects frequently degrade into unstructured spaghetti code with inconsistent middleware.*
  >
  > *NestJS brings **Angular-style modularity and Dependency Injection (DI)** to Node.js. It gives me:
  > - Clean Separation of Concerns (Controllers $\rightarrow$ Resolvers $\rightarrow$ Services $\rightarrow$ Prisma Repositories).
  > - First-class support for Guards (`JwtAuthGuard`, `RolesGuard`), Interceptors (logging, timing), and Pipes (`ValidationPipe` with `class-validator`).
  > - Seamless dual-protocol support: running Apollo GraphQL alongside REST Swagger in the same application context."*

#### Q4: "Why use GraphQL instead of traditional REST for the customer and staff applications?"
* **Direct Answer**:
  > *"Parking data is deeply relational. When a driver searches for parking, they need the `Garage`, its `Address` (lat/lng), its currently available `Slots` filtered by vehicle clearance, and its `Reviews`.*
  >
  > *In REST, this would either require **multiple network round-trips** (`GET /garages`, `GET /garages/:id/slots`, `GET /garages/:id/reviews`) or a bloated custom endpoint that **over-fetches** data.*
  >
  > *With GraphQL, the client requests exactly the fields needed in a single HTTP POST request. Furthermore, with code-first schema generation (`src/schema.gql`), my TypeScript classes generate the schema automatically, and `@graphql-codegen` generates fully-typed hooks on the frontend."*

#### Q5: "If you used GraphQL, why do you still have REST endpoints in `apps/api`?"
* **Direct Answer**:
  > *"GraphQL is ideal for client-driven UI queries, but REST is the industry standard for external integrations and webhooks. Third-party providers like Stripe do not send GraphQL mutations; they send raw HTTP POST webhooks to REST endpoints. Additionally, health checks (`/health`) and OpenAPI Swagger documentation (`/`) are best served via standard REST."*

---

### Category 3: Database, Prisma & Relational Modeling

#### Q6: "Why PostgreSQL over MongoDB for a parking reservation system?"
* **Direct Answer**:
  > *"A parking reservation system demands **strict ACID transactions and relational integrity**.
  >
  > 1. **Relational Constraints**: A `Booking` connects a `Customer`, a `Slot`, a `Garage`, and a `ValetAssignment`. Foreign keys ensure you cannot have orphaned bookings or phantom slots.
  > 2. **Double-Booking Prevention**: MongoDB is document-oriented and historically struggles with multi-document ACID transactions across concurrent users. PostgreSQL supports row-level locking (`SELECT ... FOR UPDATE`), which is critical to prevent two drivers from booking the exact same stall at the same second."*

#### Q7: "How do you handle the race condition where two drivers try to book the same parking slot simultaneously?"
* **Direct Answer**:
  > *"In `BookingsService`, slot booking is wrapped in a **Prisma interactive transaction (`prisma.$transaction`)**:
  > 1. We query existing bookings for `slotId` where the requested time overlaps with `[startTime, endTime]`.
  > 2. If overlapping active bookings exist, we immediately abort and throw a `ConflictException('Slot already reserved for this duration')`.
  > 3. At the database level, PostgreSQL transactions isolate this check, ensuring only the first committer succeeds and the second transaction is safely rolled back."*

---

### Category 4: Frontend, Next.js & 3D Graphics

#### Q8: "How does the Three.js / React Three Fiber 3D visualizer work, and how did you keep it performant?"
* **Direct Answer**:
  > *"Inside `libs/3d`, we render an interactive isometric canvas using `@react-three/fiber` and `@react-three/drei`.
  >
  > **Workflow**:
  > 1. When a garage is loaded, the GraphQL query returns the array of `Slot` entities with their floor level, slot type (Compact, EV, Standard), and status.
  > 2. We dynamically map these records into 3D meshes placed in grid coordinates.
  > 3. We use custom material shaders: Emerald Green for available, Dark Slate for occupied, and Electric Blue on hover/selection.
  >
  > **Performance Optimization**:
  > - For large multi-story garages with hundreds of bays, rendering hundreds of individual meshes would kill framerate. We use **InstancedMesh** for repetitive line markings and pillar geometry, keeping draw calls below 25 and sustaining 60 FPS even on mobile."*

#### Q9: "Why did you use Next.js 14 instead of plain Vite or Create React App?"
* **Direct Answer**:
  > *"Three reasons:
  > 1. **Server-Side Rendering (SSR) & SEO**: Garage landing pages and city-level search directories need to be indexed by Google with proper OpenGraph meta tags. Plain SPAs fail at SEO.
  > 2. **NextAuth Integration**: Next.js provides server-side session cookies that can be securely decrypted and validated on edge servers.
  > 3. **Image Optimization**: Next.js `<Image />` automatically resizes and compresses Mapbox static maps and garage cover photos into modern WebP format."*

---

### Category 5: Authentication & Payments

#### Q10: "How does authentication work across the Next.js frontends and the NestJS backend?"
* **Direct Answer**:
  > *"We use a unified JWT strategy with shared secret parity:
  > 1. **Client Auth**: The Next.js frontend uses NextAuth with both `GoogleProvider` and `CredentialsProvider`.
  > 2. **Token Minting**: When a user logs in, NextAuth mints a JWT containing the user's `uid`, `email`, and their active role (`Customer`, `Manager`, `Valet`, or `Admin`).
  > 3. **Token Transmission**: Apollo Client attaches this token in the `Authorization: Bearer <token>` HTTP header on every GraphQL request.
  > 4. **Backend Verification**: The NestJS `JwtModule` verifies the token signature using the shared `JWT_SECRET`. Our custom `RolesGuard` extracts the role claim and verifies if the user has permission to execute the requested mutation."*

#### Q11: "Why did you use Stripe Checkout Sessions instead of collecting credit card numbers on your own form?"
* **Direct Answer**:
  > *"Handling credit card details directly on your own server requires **PCI-DSS Level 1 compliance**, which involves strict cryptographic audits, penetration testing, and legal liabilities.
  >
  > By using **Stripe Checkout Sessions**:
  > - The backend calls `stripe.checkout.sessions.create()` with line items and booking metadata.
  > - The driver is redirected to Stripe's secure, PCI-compliant hosted checkout modal.
  > - Zero credit card numbers ever touch our servers or database.
  > - Upon payment confirmation, Stripe redirects to `/stripe/success` and fires webhooks to transition the booking status to `CONFIRMED`."*

---

### Category 6: Agentic AI Integration

#### Q12: "You mentioned Agentic AI. What is the difference between an AI Agent and a normal chatbot?"
* **Direct Answer**:
  > *"A normal chatbot is passive: you send text, and it generates text via an LLM. It has no access to real-time tools and cannot take actions in the real world.
  >
  > An **AI Agent is autonomous, goal-oriented, and tool-augmented**:
  > 1. **Perception**: It understands intent and extracts structured parameters from natural language.
  > 2. **Reasoning Loop**: It formulates a multi-step plan. If step 1 fails, it replans autonomously.
  > 3. **Tool Calling**: It interacts directly with our NestJS services as functions (e.g., executing `searchAvailableGarages`, `calculateRouteETA`, or `createBooking`).
  > 4. **Action**: It can create real database records, trigger Stripe checkout sessions, and notify valets without human intervention."*

#### Q13: "Can you give an example of how your Agent handles dynamic replanning?"
* **Direct Answer**:
  > *"Suppose a driver asks: 'Find me an EV spot near MSG under $30 with valet pickup.'
  >
  > - The agent calls `searchAvailableGarages({ near: 'MSG', isEV: true })`.
  > - Tool returns: The only garage with an EV stall next door charges $45 (exceeding the $30 budget).
  > - **Instead of failing**, the agent's reasoning loop catches the constraint violation. It automatically calls `searchAvailableGarages` with a slightly wider radius (800 meters), finds an available garage at $25, calls `calculateWalkingDistance` via Mapbox, and replies:
  >   *'The garage directly adjacent to MSG is $45, but I found an EV spot at 34th Street for $25 with a 4-minute walk. Would you like me to reserve it?'*
  > - That is true autonomous problem solving."*

---

## 3. Behavioral & "Tell Me About a Time" Answers

#### Q14: "What was the most challenging technical bug you encountered in this project, and how did you resolve it?"
* **STAR Framework Answer**:
  > - **Situation**: *"When building the 3D parking slot visualizer, rendering large garages with 200+ stalls caused severe frame drops and jank on mobile devices, dropping from 60 FPS to 18 FPS."*
  > - **Task**: *"I needed to optimize WebGL rendering without sacrificing individual slot clickability and real-time availability color updates."*
  > - **Action**: *"I profiled the canvas using Chrome DevTools Performance monitor and Three.js stats. I discovered the bottleneck was individual draw calls—each stall was a distinct geometry mesh. I refactored the static line markings, pillars, and floor slabs to use `InstancedMesh`, reducing draw calls from 340+ down to under 20. For interactive stalls, I implemented raycasting on bounding boxes rather than complex geometries."*
  > - **Result**: *"The canvas achieved a rock-solid 60 FPS across both mobile Safari and desktop Chrome, reducing CPU utilization by 70%."*

#### Q15: "If you had 3 more months to work on this, what would you improve?"
* **Senior Engineer Answer**:
  > *"I would focus on three enterprise scalability pillars:
  > 1. **Redis Caching Layer**: Add Redis caching in front of PostgreSQL for frequently queried garage directories and Mapbox radius results to drop database read load by 80%.
  > 2. **WebSocket Real-Time Tracking**: Replace HTTP polling with NestJS WebSockets (`@nestjs/websockets`) so valet drivers and customers see live GPS marker movement on the Mapbox map during vehicle pickup trips.
  > 3. **Automated End-to-End Testing**: Expand Playwright browser test coverage across the complete checkout and valet dispatch flow in CI/CD."*
