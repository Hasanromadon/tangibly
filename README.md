# Tangibly - Modern Full-Stack Asset Management System

A production-ready SAAS asset management platform built with Next.js 15, featuring comprehensive frontend and backend architecture with modern development practices.

## 🚀 Overview

Tangibly is a comprehensive asset management system designed for businesses to track, manage, and monitor their digital and physical assets. The platform provides role-based access control, real-time monitoring, and comprehensive reporting capabilities.

## 🏗️ Architecture

### Frontend (FE) Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**:
  - Zustand for global state
  - React Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Theming**: Dark/Light mode with next-themes

### Backend (BE) Stack

- **API**: RESTful API with Next.js App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control
- **Security**:
  - Password hashing with bcryptjs
  - Request validation with Zod
  - Rate limiting and security headers
- **Monitoring**: Comprehensive error tracking and performance monitoring

### Development & Testing

- **Code Quality**: ESLint, Prettier, TypeScript
- **Git Workflow**: Husky hooks, lint-staged, Commitizen
- **Testing**: Jest, React Testing Library, Playwright E2E
- **API Mocking**: MSW (Mock Service Worker)
- **Coverage**: 70% minimum threshold
- **Containerization**: Docker support

## 📁 Project Architecture

### Frontend Structure

```
src/
├── app/                    # Next.js App Router (FE Pages)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── layout.tsx     # Dashboard layout wrapper
│   │   └── asset-management/ # Asset management pages
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── accept-invitation/ # Invitation acceptance
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React Components (FE)
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── forms/            # Form components with validation
│   ├── common/           # Shared components
│   └── asset-management/ # Feature-specific components
├── hooks/                # Custom React hooks (FE)
│   ├── useAuth.ts        # Authentication state
│   ├── useErrorMonitoring.ts # Error tracking
│   └── usePerformance.ts # Performance monitoring
├── contexts/             # React contexts (FE)
├── store/                # Zustand stores (FE)
├── services/             # API service layer (FE ↔ BE)
└── lib/                  # Utilities (Shared)
```

### Backend Structure

```
src/
├── app/api/              # Next.js API Routes (BE)
│   ├── auth/            # Authentication endpoints
│   │   ├── login/       # POST /api/auth/login
│   │   ├── register/    # POST /api/auth/register
│   │   ├── logout/      # POST /api/auth/logout
│   │   └── me/          # GET /api/auth/me
│   ├── users/           # User management endpoints
│   ├── companies/       # Company management
│   ├── assets/          # Asset management endpoints
│   ├── monitoring/      # System monitoring
│   └── health/          # Health check endpoint
├── middleware/          # API middleware (BE)
│   ├── auth.ts         # JWT authentication
│   ├── rate-limit.ts   # Rate limiting
│   ├── security.ts     # Security headers
│   └── validation.ts   # Request validation
├── lib/database/        # Database layer (BE)
│   └── prisma.ts       # Prisma client configuration
└── schemas/             # Validation schemas (Shared)
    ├── auth-schemas.ts  # Authentication validation
    └── index.ts         # Schema exports
```

### Database Schema

```
prisma/
├── schema.prisma        # Prisma database schema
├── seed.ts             # Database seeding
└── migrations/         # Database migrations
```

## 🛠️ Development Setup

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **PostgreSQL** - Database (or Docker alternative)
- **Git** - Version control

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tangibly
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup database (Option 1: Docker - Recommended)**

   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d
   ```

   **Setup database (Option 2: Local PostgreSQL)**

   See `docs/SETUP.md` for detailed database setup instructions.

4. **Setup environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

5. **Initialize database**

   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Create database tables
   npm run db:seed      # Add sample data
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

### Default Test Users

After seeding, you can login with:

- **Admin**: admin@tangibly.com / admin123
- **User**: user@tangibly.com / user123

## 📜 Available Scripts

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prettier` - Format code with Prettier
- `npm run prettier:check` - Check code formatting
- `npm run type-check` - Run TypeScript compiler

### Testing

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:unit` - Run unit tests only
- `npm run test:components` - Run component tests only
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests in UI mode

### Database

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database

### Utilities

- `npm run analyze` - Analyze bundle size
- `npm run commit` - Commit with Commitizen

## 🎨 Adding Components

Add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Available components: button, card, input, dialog, dropdown-menu, form, table, badge, and more.

## 🔌 API Endpoints (Backend)

### Authentication APIs

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### User Management APIs

- `GET /api/users` - List all users (Admin only)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user profile
- `DELETE /api/users/[id]` - Delete user (Admin only)

### Asset Management APIs

- `GET /api/assets` - List company assets
- `POST /api/assets` - Create new asset
- `PUT /api/assets/[id]` - Update asset
- `DELETE /api/assets/[id]` - Delete asset

### Company Management APIs

- `GET /api/companies/current` - Get current company
- `PUT /api/companies/current` - Update company details

### System APIs

- `GET /api/health` - Health check endpoint
- `POST /api/monitoring/frontend-errors` - Frontend error logging

> 📖 For detailed API documentation, see [API_DOCS.md](API_DOCS.md)

## 🎨 Frontend Development

### Adding Components

```bash
# Add new shadcn/ui components
npx shadcn@latest add [component-name]

# Available: button, card, input, dialog, dropdown-menu, form, table, etc.
```

### Component Architecture (Frontend)

- **UI Components** (`components/ui/`) - Base shadcn/ui components
- **Common Components** (`components/common/`) - Shared components (ThemeToggle, LoadingSpinner)
- **Form Components** (`components/forms/`) - Form components with validation
- **Feature Components** (`components/asset-management/`) - Feature-specific components

### State Management (Frontend)

- **Global State** (`store/`) - Zustand stores for app-wide state
- **Server State** (`hooks/`) - React Query hooks for API data
- **Local State** - React useState/useReducer for component state
- **Context** (`contexts/`) - React contexts for shared state

## 📦 Dependencies Overview

### Frontend Dependencies

```json
{
  "next": "React framework with App Router",
  "react": "UI library",
  "typescript": "Type safety",
  "tailwindcss": "Utility-first CSS",
  "zustand": "Lightweight state management",
  "@tanstack/react-query": "Server state management",
  "react-hook-form": "Form handling",
  "zod": "Schema validation",
  "framer-motion": "Animations",
  "next-themes": "Theme management"
}
```

### Backend Dependencies

```json
{
  "@prisma/client": "Type-safe database client",
  "prisma": "Database toolkit",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "zod": "Runtime validation"
}
```

### Development & Testing Dependencies

```json
{
  "eslint": "Code linting",
  "prettier": "Code formatting",
  "husky": "Git hooks",
  "jest": "Testing framework",
  "@testing-library/react": "Component testing",
  "playwright": "E2E testing",
  "msw": "API mocking"
}
```

## 🧪 Testing

This project includes comprehensive testing setup with unit testing, component testing, API testing, and end-to-end testing.

### Testing Framework

- **Jest** - Unit and integration testing with Next.js integration
- **React Testing Library** - Component testing with user-centric approach
- **Playwright** - Cross-browser end-to-end testing
- **MSW (Mock Service Worker)** - API mocking for testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run component tests only
npm run test:components

# Run end-to-end tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Install Playwright browsers (first time only)
npx playwright install
```

## 🧪 Testing Framework

### Testing Strategy (Frontend & Backend)

- **Unit Tests** (70%) - Individual functions and utilities
- **Component Tests** (20%) - React components with user interactions
- **API Tests** (10%) - Backend endpoints with database integration
- **E2E Tests** (5%) - Complete user workflows across browsers

### Testing Tools

- **Jest** - Unit and integration testing with Next.js support
- **React Testing Library** - Component testing with user-centric approach
- **Playwright** - Cross-browser end-to-end testing
- **MSW** - API mocking for consistent testing environment

### Quick Testing Commands

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode for development
npm run test:coverage      # Generate coverage reports
npm run test:e2e           # End-to-end testing
npx playwright install     # Install E2E browsers (first time)
```

### Coverage Standards

- **Minimum 70%** coverage for statements, branches, functions, lines
- **Focus areas**: Authentication, asset management, data validation
- **Reports**: Generated in `coverage/` directory

> 📖 For comprehensive testing guide, see [TESTING_SETUP.md](TESTING_SETUP.md)

## 🏗️ Development Standards

### Code Quality

- **TypeScript** - Strict type checking enabled
- **ESLint** - Code linting with Next.js rules
- **Prettier** - Consistent code formatting
- **Husky** - Pre-commit hooks for quality gates

### Architecture Principles

- **SOLID Principles** - Single responsibility, dependency inversion
- **Component Composition** - Reusable, testable components
- **API Design** - RESTful endpoints with consistent responses
- **Error Handling** - Comprehensive error boundaries and logging

> 📖 For detailed architecture patterns, see [ARCHITECTURE.md](ARCHITECTURE.md)

## 📚 Documentation

| Document                                                     | Purpose                      | Audience              | Type     |
| ------------------------------------------------------------ | ---------------------------- | --------------------- | -------- |
| [README.md](README.md)                                       | Project overview and setup   | All developers        | General  |
| **Backend (BE) Docs**                                        |                              |                       |          |
| [API_DOCS.md](API_DOCS.md)                                   | Complete API reference       | Backend/Frontend devs | BE       |
| [docs/POSTGRESQL_SETUP.md](docs/POSTGRESQL_SETUP.md)         | Database setup guide         | Backend devs          | BE       |
| **Frontend (FE) Docs**                                       |                              |                       |          |
| [FRONTEND_MONITORING.md](FRONTEND_MONITORING.md)             | Error monitoring & logging   | Frontend devs         | FE       |
| **Full-Stack Docs**                                          |                              |                       |          |
| [ARCHITECTURE.md](ARCHITECTURE.md)                           | Code patterns and principles | All developers        | FE + BE  |
| [TESTING_SETUP.md](TESTING_SETUP.md)                         | Testing framework guide      | All developers        | FE + BE  |
| [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)         | Project progress status      | All developers        | FE + BE  |
| **Operations Docs**                                          |                              |                       |          |
| [DEPLOYMENT.md](DEPLOYMENT.md)                               | Deployment instructions      | DevOps/Backend devs   | DevOps   |
| [docs/SECURITY_PERFORMANCE.md](docs/SECURITY_PERFORMANCE.md) | Security & performance guide | All developers        | Security |

## 🚀 Deployment

### Environment Requirements

- **Node.js 18+** - Runtime environment
- **PostgreSQL** - Database server
- **Environment Variables** - See `.env.example`

### Deployment Platforms

- **Vercel** (Recommended) - Zero-config deployment
- **Railway** - Database and app hosting
- **Heroku** - Traditional PaaS option
- **Docker** - Containerized deployment

### Quick Deploy to Vercel

```bash
npm run build          # Build production bundle
vercel --prod          # Deploy to production
```

> 📖 For detailed deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
