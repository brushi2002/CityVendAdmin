# CityVend Admin Dashboard

Admin dashboard for CityVend, built with Next.js and TypeScript. Connects to the same SQL Server database (AWS RDS) and stored procedures as the legacy .NET admin site.

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions)
- **UI**: Ant Design
- **Database**: SQL Server via `mssql` npm package (in `library/`)
- **Auth**: JWT (HS256), compatible with the existing .NET token format

## Prerequisites

- Node.js 18+
- Access to the CityVend SQL Server database (AWS RDS)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```

## Development

```bash
npm run dev            # Starts Next.js dev server on port 3000
npm run build          # Production build
npm start              # Start production server
```

## Project Structure

```
CityVendAdmin/
├── library/           # Database module — ALL DB interaction goes through here
│   ├── db.ts          # SQL Server connection pool
│   ├── types.ts       # TypeScript interfaces and enums
│   ├── auth.helpers.ts # JWT and password hashing (PBKDF2, compatible with .NET)
│   ├── users.repository.ts
│   ├── dashboard.repository.ts
│   └── index.ts       # Re-exports
├── app/
│   ├── actions.ts     # Server actions (auth, data fetching, password management)
│   ├── layout.tsx     # Root layout
│   ├── login/         # Login page
│   ├── forgot-password/
│   ├── reset-password/
│   └── (dashboard)/   # Protected pages with sidebar layout
│       ├── layout.tsx # Dashboard layout (sidebar + top bar)
│       ├── business/  # Business list & detail pages
│       ├── users/     # User list & detail pages
│       └── settings/  # Change admin password
└── middleware.ts      # Auth check — redirects to /login if no token
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Admin login |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset with code |
| `/business` | Business list with pagination and filters |
| `/business/:id` | Business detail view |
| `/users` | User list with pagination and filters |
| `/users/:id` | User detail view (+ admin password reset) |
| `/settings` | Change admin password |

## Database

All database access is centralized in the `library/` folder. The app calls existing SQL Server stored procedures directly via Next.js server actions — no separate API server needed.

## Auth Compatibility

JWT tokens and password hashes are fully compatible with the existing .NET system:
- **JWT**: HS256 with the same shared secret and payload structure
- **Passwords**: PBKDF2 with SHA1, 50,000 iterations, 24-byte salt, 20-byte hash
