# 🤝 Contributing to AutoSpace

Thank you for your interest in contributing to AutoSpace! This document outlines our monorepo conventions, branch workflow, and code standards.

---

## 🌲 Git Branch & Commit Conventions

We follow the **Conventional Commits** specification:

- `feat(scope)`: A new feature (e.g. `feat(api): implement /health route`)
- `fix(scope)`: A bug fix (e.g. `fix(web): resolve mapbox marker positioning`)
- `docs(scope)`: Documentation only (e.g. `docs: update API port matrix`)
- `chore(scope)`: Tooling, configs, or dependencies (e.g. `chore(ci): update workflow`)
- `refactor(scope)`: Code change that neither fixes a bug nor adds a feature

---

## 🚀 Local Development Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/sushilsahoo06/autospace-workshop.git
   cd autospace-workshop
   yarn install
   ```

2. **Database Setup**:
   ```bash
   docker-compose up -d
   yarn prisma db push --schema=apps/api/prisma/schema.prisma
   ```

3. **Verify Monorepo Build**:
   ```bash
   yarn nx run-many -t build
   ```

---

## 🛡️ Pre-Commit Quality Checks

Every pull request runs automated checks via **GitHub Actions** (`AutoSpace CI`):
- TypeScript compilation (`tsc --noEmit`)
- ESLint code quality (`yarn lint`)
- Automated unit test suites (`yarn test`)

