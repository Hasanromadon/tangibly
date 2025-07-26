# Tangibly - Modern Full-Stack Next.js Application

A modern, production-ready full-stack Next.js application built with the latest frontend and backend technologies.

## 🚀 Features

### Frontend

- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** for beautiful, accessible components
- **Zustand** for lightweight state management
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **Framer Motion** for animations
- **Dark/Light mode** with next-themes

### Backend

- **RESTful API** with Next.js App Router
- **Prisma ORM** with PostgreSQL
- **JWT Authentication** with role-based access
- **Password hashing** with bcryptjs
- **Request validation** with Zod
- **Type-safe database** queries
- **Session management**

### Development

- **ESLint & Prettier** for code quality
- **Husky & lint-staged** for pre-commit hooks
- **Commitizen** for conventional commits
- **Docker** support for database

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── users/        # User management
│   │   └── posts/        # Content management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── common/           # Shared components
│   ├── forms/            # Form components
│   └── ui/               # shadcn/ui components
├── constants/            # App constants
├── hooks/               # Custom React hooks
├── lib/                # Utility functions
│   ├── auth.ts         # Authentication helpers
│   ├── api-response.ts # API response utilities
│   └── database/       # Database configuration
├── middleware/         # API middleware
├── providers/          # Context providers
├── schemas/           # Zod validation schemas
├── services/         # API services
├── store/           # Zustand stores
└── types/          # TypeScript types

prisma/
├── schema.prisma      # Database schema
└── seed.ts           # Database seeding

docs/
├── API.md            # API documentation
└── SETUP.md          # Setup instructions
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Docker)

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

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### User Management

- `GET /api/users` - Get all users (Admin)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (Admin)

### Posts

- `GET /api/posts` - Get all published posts
- `POST /api/posts` - Create new post (Auth required)

For detailed API documentation, see `docs/API.md`.

## 🗂️ Code Organization

### Components

- `components/ui/` - shadcn/ui components
- `components/common/` - Shared components (ThemeToggle, LoadingSpinner, etc.)
- `components/forms/` - Form components with validation

### State Management

- `store/` - Zustand stores for global state
- `hooks/` - Custom hooks for local state and logic

### Data & Types

- `schemas/` - Zod validation schemas
- `types/` - TypeScript type definitions
- `constants/` - App constants and configurations

### Services

- `services/api.ts` - API service layer
- `lib/utils.ts` - Utility functions

## 🎯 Best Practices

- Use TypeScript for all files
- Follow the established folder structure
- Use Zod for runtime validation
- Implement proper error handling
- Write meaningful commit messages
- Use semantic versioning

## 🔧 Configuration Files

- `.prettierrc` - Prettier configuration
- `eslint.config.mjs` - ESLint configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration

## 📦 Key Dependencies

### Frontend

- **next** - React framework
- **react** & **react-dom** - React library
- **typescript** - Type safety
- **tailwindcss** - CSS framework
- **zustand** - State management
- **@tanstack/react-query** - Server state
- **react-hook-form** - Form handling
- **zod** - Schema validation
- **framer-motion** - Animations
- **next-themes** - Theme management

### Backend

- **@prisma/client** - Database ORM
- **prisma** - Database toolkit
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **zod** - Request validation

### Development

- **eslint** & **prettier** - Code quality
- **husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **commitizen** - Conventional commits
- **tsx** - TypeScript execution

## 🚀 Deployment

The app is ready to deploy on Vercel, Netlify, or any Node.js hosting platform.

For Vercel:

```bash
npm run build
```

## 📄 License

MIT License - see LICENSE file for details.
