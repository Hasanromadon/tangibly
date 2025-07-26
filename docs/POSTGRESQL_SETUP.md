# PostgreSQL Setup Guide

## Quick Start with Docker

1. **Start PostgreSQL container:**

   ```bash
   docker-compose up -d postgres
   ```

2. **Copy environment variables:**

   ```bash
   cp .env.example .env
   ```

3. **Update database credentials in `.env`:**

   ```env
   DATABASE_URL="postgresql://tangibly_user:tangibly_pass@localhost:5432/tangibly_db?schema=public"
   ```

4. **Generate Prisma client and run migrations:**

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Manual PostgreSQL Setup

If you prefer to install PostgreSQL manually:

1. **Install PostgreSQL:**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`

2. **Create database and user:**

   ```sql
   CREATE USER tangibly_user WITH PASSWORD 'tangibly_pass';
   CREATE DATABASE tangibly_db OWNER tangibly_user;
   GRANT ALL PRIVILEGES ON DATABASE tangibly_db TO tangibly_user;
   ```

3. **Update DATABASE_URL in `.env`**

## Database Management

- **Reset database:** `npm run db:reset`
- **View database:** `npm run db:studio`
- **Generate client:** `npm run db:generate`
- **Deploy migrations:** `npm run db:deploy` (production)

## pgAdmin (Optional)

Start pgAdmin for database management:

```bash
docker-compose up -d pgadmin
```

Access at: http://localhost:5050

- Email: admin@tangibly.com
- Password: admin
