# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Next.js 14 (App Router) admin dashboard for CityVend. Replaces the legacy .NET MVC admin site. Connects directly to the same SQL Server database (AWS RDS) and stored procedures used by the .NET backend and React Native mobile app.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server on localhost:3000
npm run build      # production build
npm start          # start production server
```

No test runner or linter is currently configured.

## Environment

Copy `.env.example` to `.env` and fill in database credentials. Key variables: `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `APP_ENV` (set to `DEV` to show the red dev-server banner).

## Architecture

### Data Flow

Server Actions (`app/actions.ts`) are the single entry point for all data operations. Pages call server actions directly — there is no REST API layer. Server actions call repository functions in `library/`, which execute SQL Server stored procedures via the `mssql` package.

```
Page/Component → Server Action (app/actions.ts) → Repository (library/*.repository.ts) → Stored Procedure
```

### Auth

- **Middleware** (`middleware.ts`): checks for `usertoken` cookie on all routes except `/login`, `/forgot-password`, `/reset-password`. Redirects to `/login` if missing.
- **Dashboard layout** (`app/(dashboard)/layout.tsx`): validates the JWT server-side via `getSession()` and redirects if invalid/expired.
- **JWT**: HS256, shared secret with the .NET backend. Tokens have no `exp` claim — expiry is checked manually via `TokenIssuedOn` (7-day lifetime). Payload structure matches `JWTAuthPayload` in `library/types.ts`.
- **Passwords**: PBKDF2 with SHA1, 50k iterations, 24-byte salt, 20-byte hash. Format: `iterations:salt_base64:hash_base64`. Must stay compatible with the .NET `Rfc2898DeriveBytes` implementation.

### Database Layer (`library/`)

- `db.ts` — singleton `mssql` connection pool configured from env vars.
- `types.ts` — TypeScript interfaces and enums mirroring `CityVend.Services.Model` and `CityVend.Services.Common.EnumWrapper`. Keep these in sync with the .NET models.
- `users.repository.ts` — user CRUD via stored procedures (`UsersGetByEmail`, `UsersGetById`, `UsersGetByFiltration`, etc.).
- `dashboard.repository.ts` — business queries (`BusinessGetById`, `BusinessTypeMasterGet`, `BusinessCategoryMasterGet`).
- `auth.helpers.ts` — password hashing and JWT sign/verify.
- `index.ts` — barrel re-export.

### UI

Ant Design 5 with `@ant-design/nextjs-registry` for SSR compatibility. The `(dashboard)` route group uses a shared sidebar layout (`DashboardLayout.tsx`).

### Path Alias

`@/*` maps to the project root (e.g., `@/library/types`).

## Code Style

- **Comments**: Add a descriptive comment to every new method or function. Also add comments to existing code when the logic is non-obvious or could benefit from clarification.
- **README updates**: After making changes, check if `README.md` needs to be updated (e.g., new features, changed setup steps, new environment variables, new dependencies). Update it if so.

## Key Constraints

- **Stored procedure compatibility**: All database operations use existing stored procedures shared with the .NET backend. Do not introduce raw SQL queries or ORM patterns.
- **Auth format compatibility**: JWT payload structure and password hashing must remain compatible with the .NET system so users can authenticate across both systems.
- **Enum values**: Status, Role, BusinessGroup, and SubscriptionStatus enums in `library/types.ts` must match the values in the .NET `EnumWrapper`.
