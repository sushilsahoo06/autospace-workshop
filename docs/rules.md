# Engineering Standards, Code Conventions & Rules

---

## 1. Monorepo Architecture & Boundary Rules

1. **Nx Workspace Isolation**:
   - Applications in `apps/*` must **never** import directly from another application in `apps/*`.
   - Shared logic must reside in `libs/*` (`libs/ui`, `libs/network`, `libs/3d`, `libs/forms`, `libs/util`).
   - Cross-boundary imports must always use clean package aliases (e.g. `import { useMapbox } from '@autospace/util'`), never relative traversals into peer libraries (e.g. `../../libs/util/...`).

2. **Nohoist Dependencies**:
   - NestJS core dependencies (`@nestjs/common`, `@nestjs/core`, `@nestjs/graphql`) are listed in `package.json` under `nohoist` to prevent runtime version collision with Next.js client bundles.

---

## 2. TypeScript & Code Conventions

1. **Strict Type Safety**:
   - `noImplicitAny: true` and `strict: true` are enforced in `tsconfig.json`.
   - Avoid using `any`. If a dynamic type is strictly unavoidable, use `unknown` and perform runtime narrowing or type guards.
2. **Naming Conventions**:
   - **Files**: `kebab-case.ts` (e.g. `create-stripe-session.dto.ts`, `valet-trip-card.tsx`).
   - **Components & Classes**: `PascalCase` (e.g. `ValetTripCard`, `BookingsService`).
   - **Functions & Variables**: `camelCase` (e.g. `calculateDistance`, `isStripeConfigured`).
   - **Constants & Enums**: `UPPER_SNAKE_CASE` (e.g. `MAX_AGE`, `AuthProviderType.GOOGLE`).
   - **GraphQL Operations**: Query and Mutation documents must end with `Document` suffix (generated via `@graphql-codegen`).

---

## 3. Database & Prisma Migration Rules

1. **Schema Modifications**:
   - All changes to the database structure must be authored in `apps/api/prisma/schema.prisma`.
   - Never alter database columns directly in PostgreSQL CLI; always apply Prisma migrations:
     ```bash
     yarn prisma migrate dev --name <descriptive_migration_name>
     ```
2. **Schema Codegen**:
   - Whenever Prisma schema changes, regenerate GraphQL and REST entity definitions:
     ```bash
     cd apps/api
     yarn entity:complete
     ```
   - Then regenerate client-side network query documents:
     ```bash
     cd libs/network
     yarn codegen
     ```
3. **Data Integrity**:
   - Relations must enforce foreign key cascading appropriately (e.g. deleting a `User` cascades down to `Credentials` and `Customer` profile).
   - Use Prisma transactions (`prisma.$transaction([...])`) when updating slot availability and creating booking records simultaneously to prevent race conditions.

---

## 4. API & GraphQL Resolver Standards

1. **DTO Validation**:
   - All REST controllers and GraphQL mutation inputs must be strongly typed using DTO classes decorated with `class-validator` (`@IsNotEmpty`, `@IsEmail`, `@Min`, `@Max`).
2. **Security & Authentication Guards**:
   - Any resolver mutating or reading private user records must be annotated with `@UseGuards(JwtAuthGuard)`.
   - Role-specific actions must use custom metadata decorators:
     ```typescript
     @Roles(Role.MANAGER)
     @UseGuards(JwtAuthGuard, RolesGuard)
     ```
3. **Error Handling**:
   - Throw semantic NestJS HTTP/GraphQL exceptions (`NotFoundException`, `UnauthorizedException`, `BadRequestException`).
   - Never expose internal database stack traces or raw SQL syntax errors to the client.

---

## 5. Security & Environment Variable Guidelines

1. **Zero Secret Commitment**:
   - Never commit `.env` files into source control. Only commit `.env.example` templates with sanitized placeholder values.
2. **Client-Side Secret Isolation**:
   - Next.js exposes environment variables to the browser **only** if they begin with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_MAPBOX_TOKEN`).
   - Private keys (e.g. `STRIPE_SECRET_KEY`, `JWT_SECRET`, `DATABASE_URL`) must **never** be prefixed with `NEXT_PUBLIC_` and must only be read in server-side runtimes.
3. **Password Security**:
   - Passwords must be hashed using `bcryptjs` with a minimum of 10 salt rounds before persisting to `Credentials`.

---

## 6. Git Workflow & Conventional Commits

1. **Commit Message Format**:
   All commits must follow the **Conventional Commits** specification:
   ```
   <type>(<scope>): <short description>
   ```
   - **Types**:
     - `feat`: A new user-facing feature.
     - `fix`: A bug fix.
     - `docs`: Documentation updates.
     - `style`: Formatting, missing semi-colons, no code change.
     - `refactor`: Refactoring production code without changing behavior.
     - `test`: Adding or updating tests.
     - `chore`: Tooling, dependency updates, build tasks.
   - **Examples**:
     - `feat(web): add 3d interactive slot hover states`
     - `fix(api): handle stripe webhook zero-amount session failure`
     - `docs(arch): update core runtime architecture diagrams`

2. **Pre-commit Validation**:
   Husky pre-commit hooks run automatically before commits:
   ```bash
   yarn validate
   ```
   This script runs `yarn format:write`, `yarn tsc`, `yarn lint`, and `yarn build` across all packages.
