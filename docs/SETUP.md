# Backend Setup Guide

## Prerequisites

Before you can run the backend, you need to set up a PostgreSQL database.

## Option 1: Local PostgreSQL Installation

1. **Install PostgreSQL:**
   - Download from: https://www.postgresql.org/download/windows/
   - Follow the installation wizard
   - Remember the password you set for the `postgres` user

2. **Create Database:**

   ```sql
   -- Connect to PostgreSQL as postgres user
   CREATE DATABASE tangibly_db;
   CREATE USER tangibly_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE tangibly_db TO tangibly_user;
   ```

3. **Update Environment Variables:**

   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```env
   DATABASE_URL="postgresql://tangibly_user:your_password@localhost:5432/tangibly_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   ```

## Option 2: Docker PostgreSQL (Recommended)

1. **Create docker-compose.yml:**

   ```yaml
   version: "3.8"
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_USER: tangibly_user
         POSTGRES_PASSWORD: tangibly_pass
         POSTGRES_DB: tangibly_db
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

2. **Start Database:**

   ```bash
   docker-compose up -d
   ```

3. **Update .env.local:**
   ```env
   DATABASE_URL="postgresql://tangibly_user:tangibly_pass@localhost:5432/tangibly_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   ```

## Option 3: Cloud Database (Supabase/Neon)

1. **Create a free PostgreSQL database on:**
   - Supabase: https://supabase.com
   - Neon: https://neon.tech
   - Railway: https://railway.app

2. **Get your connection string and update .env.local:**
   ```env
   DATABASE_URL="your-cloud-database-url"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   ```

## Initialize Database

Once your database is running and .env.local is configured:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

## Verify Setup

1. **Check Database Connection:**

   ```bash
   npx prisma db pull
   ```

2. **View Database in Prisma Studio:**

   ```bash
   npx prisma studio
   ```

3. **Test API Endpoints:**
   - Register: POST http://localhost:3000/api/auth/register
   - Login: POST http://localhost:3000/api/auth/login

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify username/password
- Check port availability (5432)

### Migration Issues

```bash
# Reset database if needed
npx prisma migrate reset

# Or manually reset
npx prisma db push --force-reset
```

### Environment Variables

- Ensure .env.local exists in project root
- Check for typos in variable names
- Restart development server after changes

## Default Test Users

After running `npm run db:seed`:

- **Admin User:**
  - Email: admin@tangibly.com
  - Password: admin123
  - Role: ADMIN

- **Regular User:**
  - Email: user@tangibly.com
  - Password: user123
  - Role: USER

## API Testing

Use these curl commands or Postman to test:

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tangibly.com","password":"admin123"}'

# Get current user (replace TOKEN with actual JWT)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Next Steps

1. Set up your database (choose one option above)
2. Configure .env.local with your database credentials
3. Run database initialization commands
4. Start the development server
5. Test the API endpoints
6. Begin building your frontend features!

For detailed API documentation, see `docs/API.md`.
