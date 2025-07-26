# Tangibly - Modern Next.js Application

A modern, production-ready Next.js application built with the latest frontend technologies and best practices.

## 🚀 Features

- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** for beautiful, accessible components
- **Zustand** for lightweight state management
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **Framer Motion** for animations
- **Dark/Light mode** with next-themes
- **ESLint & Prettier** for code quality
- **Husky & lint-staged** for pre-commit hooks
- **Commitizen** for conventional commits

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
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
├── providers/          # Context providers
├── schemas/           # Zod validation schemas
├── services/         # API services
├── store/           # Zustand stores
└── types/          # TypeScript types
```

## 🛠️ Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tangibly
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prettier` - Format code with Prettier
- `npm run prettier:check` - Check code formatting
- `npm run type-check` - Run TypeScript compiler
- `npm run analyze` - Analyze bundle size
- `npm run commit` - Commit with Commitizen

## 🎨 Adding Components

Add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Available components: button, card, input, dialog, dropdown-menu, form, table, badge, and more.

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

### Production

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

### Development

- **eslint** & **prettier** - Code quality
- **husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **commitizen** - Conventional commits

## 🚀 Deployment

The app is ready to deploy on Vercel, Netlify, or any Node.js hosting platform.

For Vercel:

```bash
npm run build
```

## 📄 License

MIT License - see LICENSE file for details.
