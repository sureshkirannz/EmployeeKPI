# Employee KPI Tracking Application

## Overview

This is a comprehensive Employee KPI (Key Performance Indicator) tracking web application designed for sales professionals in the mortgage/lending industry. The system enables administrators to manage employee accounts, set performance targets, and monitor progress, while employees can track their daily activities, manage loan pipelines, and maintain realtor relationships. The application features role-based dashboards with real-time performance metrics, goal tracking, and comprehensive reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System:**
- Shadcn UI components built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- "New York" variant of Shadcn with Material Design influences
- Custom color system using CSS variables for theming
- Typography: Inter for UI text, JetBrains Mono for numerical KPIs
- Responsive grid layouts with mobile-first approach

**State Management:**
- TanStack Query for server state, caching, and data synchronization
- Local React state for UI interactions
- Cookie-based authentication state via HTTP-only cookies

**Charts & Visualization:**
- Recharts library for KPI dashboards and progress tracking
- Custom chart components (ProgressChart, ActivityBreakdownChart)
- Responsive charts that adapt to container sizes

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server
- TypeScript for type safety across the stack
- RESTful API design pattern

**Authentication & Authorization:**
- JWT (JSON Web Tokens) for session management
- Bcrypt for password hashing with configurable salt rounds
- HTTP-only cookies for token storage (secure in production)
- Role-based access control with two roles: "admin" and "employee"
- Middleware-based authentication (`requireAuth`, `requireAdmin`)

**Database Layer:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the database (via Neon serverless)
- WebSocket support for Neon connection pooling
- Schema-first approach with TypeScript type inference
- Database migrations managed through Drizzle Kit

**Data Models:**
- Users (authentication + employee profiles)
- Employee KPI Targets (annual volume, loan metrics)
- Employee Sales Targets (yearly activity goals)
- Weekly Activities (face-to-face meetings, events, videos, etc.)
- Daily Activities (calls, appointments, applications)
- Loans (pipeline management with status tracking)
- Past Clients (relationship management)
- Top Realtors (referral source tracking)
- Realtor Partners (relationship strength tracking)
- Coaching Notes (admin feedback system)

**API Structure:**
- `/api/auth/*` - Authentication endpoints (login, logout, current user)
- `/api/admin/*` - Admin-only endpoints (user management, reports, coaching)
- `/api/employee/*` - Employee endpoints (activities, loans, partners)
- Consistent error handling with HTTP status codes
- JSON request/response format

### Security Decisions

**Password Security:**
- Bcrypt hashing with 10 salt rounds
- Passwords never stored in plain text
- Optional password updates (empty password = no change)

**Token Security:**
- 7-day JWT expiration
- Configurable secret via environment variable
- Secure cookies in production environment (HTTPS only)
- SameSite "lax" cookie policy to prevent CSRF

**Authorization:**
- Route-level middleware protection
- User role validation on protected endpoints
- User lookup verification on each authenticated request

### Development & Deployment

**Development Workflow:**
- TypeScript compilation checking via `tsc`
- Hot module replacement (HMR) via Vite
- Development server with middleware mode integration
- Replit-specific plugins for error overlay and development banner

**Build Process:**
- Client: Vite builds React app to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js`
- ESM (ES Modules) format throughout
- External packages not bundled on server side

**Environment Configuration:**
- `DATABASE_URL` required for PostgreSQL connection
- `SESSION_SECRET` for JWT signing (defaults to development secret)
- `NODE_ENV` for production/development behavior switching

## External Dependencies

### Core Infrastructure

**Database:**
- Neon Serverless PostgreSQL (via `@neondatabase/serverless`)
- Connection pooling with WebSocket support
- Database schema managed by Drizzle ORM

**ORM & Migrations:**
- Drizzle ORM for database operations
- Drizzle Kit for schema migrations
- Type-safe queries with full TypeScript support

### Authentication & Security

**Libraries:**
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT generation and verification
- `cookie-parser` - Cookie handling middleware

### UI Component Libraries

**Component Primitives:**
- Radix UI suite (dialogs, dropdowns, popovers, tooltips, etc.)
- Provides accessible, unstyled component primitives
- Used as foundation for Shadcn components

**Utilities:**
- `class-variance-authority` - Variant-based component styling
- `clsx` & `tailwind-merge` - Dynamic className composition
- `cmdk` - Command palette component

### Data Visualization

**Charting:**
- Recharts for all chart components
- Area charts, bar charts, line charts, composed charts
- Responsive container support

### Form Handling

**Validation:**
- React Hook Form for form state management
- Zod for schema validation
- `@hookform/resolvers` for Zod integration
- Drizzle-Zod for generating Zod schemas from database schema

### Date Handling

**Library:**
- `date-fns` for date manipulation and formatting
- Used extensively for week calculations and date range filtering

### Development Tools

**Replit Integration:**
- `@replit/vite-plugin-runtime-error-modal` - Runtime error overlay
- `@replit/vite-plugin-cartographer` - Development tooling
- `@replit/vite-plugin-dev-banner` - Development mode banner

**Build Tools:**
- Vite for frontend bundling
- esbuild for server bundling
- PostCSS with Tailwind CSS and Autoprefixer