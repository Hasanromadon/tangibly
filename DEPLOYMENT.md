# SAAS Asset Management System Setup Guide

This comprehensive guide will help you set up the SAAS Asset Management System for Indonesian companies with ISO compliance.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- Git

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd tangibly
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL locally
# Create database
createdb tangibly_asset_management

# Copy environment variables
cp .env.example .env

# Update .env with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/tangibly_asset_management"
```

#### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL with Docker
npm run docker:db

# Database will be available at localhost:5432
# Default credentials: username=postgres, password=password
```

### 3. Database Migration and Seeding

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed with demo data (creates 2 companies with full asset data)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the asset management dashboard.

## Demo Login Credentials

After seeding, you can login with:

### PT Teknologi Maju Indonesia (TMI)

- **Admin**: admin@teknomai.co.id / password123
- **User**: user@teknomai.co.id / password123

### CV Berkah Sejahtera (BRS)

- **Admin**: admin@berkahsejahtera.co.id / password123

## Features Overview

### ✅ Multi-Tenant SAAS Architecture

- Company-based workspaces
- Role-based access control (Admin, User, Viewer)
- Subscription management (Enterprise, Professional, Basic)

### ✅ Comprehensive Asset Management

- **Asset Categories**: IT Equipment, Vehicles, Furniture, Machinery
- **Asset Lifecycle**: Purchase → Active → Maintenance → Disposal
- **QR Code Integration**: Generate and scan QR codes for assets
- **Asset Tracking**: Location, assignment, movement history

### ✅ ISO Compliance Framework

- **ISO 27001**: IT Asset security classification and controls
- **ISO 14001**: Environmental impact tracking for assets
- **Audit Logging**: Complete activity trail for compliance
- **Compliance Status**: Track and report compliance per asset

### ✅ Indonesian Business Standards

- **NPWP Integration**: Indonesian tax ID validation
- **PSAK 16 Compliance**: Asset depreciation per Indonesian accounting standards
- **Local Currency**: IDR formatting and calculations
- **Indonesian Locale**: Date/time formatting for Indonesia

### ✅ Financial Management

- **Depreciation Calculation**: Straight-line, declining balance, units of production
- **Book Value Tracking**: Real-time asset valuation
- **Purchase Cost Management**: Complete financial history
- **Vendor Management**: Supplier relationships and payment terms

### ✅ Maintenance Management

- **Preventive Maintenance**: Scheduled maintenance workflows
- **Work Orders**: Create, assign, and track maintenance tasks
- **Maintenance Types**: Computer maintenance, vehicle service, etc.
- **Parts Management**: Track parts used in maintenance

### ✅ Location & Movement Tracking

- **Multi-Location Support**: Offices, branches, factories
- **Asset Movements**: Transfer assets between locations
- **Assignment Tracking**: Who has what asset
- **Geographic Coordinates**: Map integration ready

### ✅ Reporting & Analytics

- **Dashboard Overview**: Asset metrics, compliance status, financial summary
- **Depreciation Reports**: PSAK 16 compliant financial reports
- **Maintenance Reports**: Schedule and completion tracking
- **Audit Reports**: ISO compliance documentation

## Architecture Overview

### Database Schema

- **Multi-tenant**: All tables have `companyId` for data isolation
- **Comprehensive**: 11 main entities covering full asset lifecycle
- **Scalable**: Designed for thousands of assets per company
- **Compliant**: Built-in fields for ISO and Indonesian standards

### API Structure

```
/api/companies     - Company management
/api/assets        - Asset CRUD with filtering
/api/locations     - Location management
/api/vendors       - Vendor relationships
/api/work-orders   - Maintenance workflows
/api/audit-logs    - Compliance tracking
```

### UI Components

- **Dashboard**: Multi-tab overview with metrics
- **Asset Management**: CRUD interface with advanced filtering
- **Compliance Tracking**: ISO status and audit history
- **Financial Views**: Depreciation and valuation reports

## Deployment Guide

### Production Environment Setup

#### 1. Environment Variables

```bash
# Copy and update for production
cp .env.example .env.production

# Critical settings for production:
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_SECRET="your-production-nextauth-secret"
```

#### 2. Database Migration

```bash
# Deploy migrations to production
npm run db:deploy

# Optional: Seed production data
npm run db:seed-prod
```

#### 3. Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Database Backup Strategy

```bash
# Backup database
npm run db:backup

# Restore database
npm run db:restore
```

## Security Features

### Authentication & Authorization

- JWT-based authentication
- Role-based permissions
- Multi-factor authentication ready
- Session management

### Data Protection

- Password hashing with bcrypt
- SQL injection protection with Prisma
- Input validation with Zod
- Audit logging for compliance

### Multi-tenant Security

- Row-level security with company isolation
- User permissions per company
- Secure API endpoints with company context

## Indonesian Compliance Features

### Tax Compliance (NPWP)

- NPWP validation and storage
- Tax-compliant depreciation methods
- Indonesian rupiah (IDR) calculations

### Accounting Standards (PSAK 16)

- Straight-line depreciation
- Declining balance method
- Units of production method
- Asset revaluation support

### Local Business Requirements

- Indonesian address formats
- Local phone number validation
- Business registration support
- Provincial/city data structure

## API Documentation

### Asset Management API

#### Get Assets

```http
GET /api/assets?page=1&limit=10&category=IT&status=active
```

#### Create Asset

```http
POST /api/assets
Content-Type: application/json

{
  "name": "Dell Laptop",
  "categoryId": "uuid",
  "purchaseCost": 15000000,
  "purchaseDate": "2024-01-15"
}
```

#### Asset QR Code

```http
GET /api/assets/[id]/qr-code
```

### Company Management API

#### Get Company Settings

```http
GET /api/companies/[id]/settings
```

#### Update Company Settings

```http
PUT /api/companies/[id]/settings
Content-Type: application/json

{
  "timezone": "Asia/Jakarta",
  "currency": "IDR",
  "defaultDepreciationMethod": "straight_line"
}
```

## Customization Guide

### Adding New Asset Categories

1. Update database schema in `prisma/schema.prisma`
2. Add category-specific fields to asset model
3. Update TypeScript types in `src/types/asset-management.ts`
4. Create category-specific UI components

### Custom Depreciation Methods

1. Add method to `calculateDepreciation` function in `src/lib/auth.ts`
2. Update database enum in schema
3. Add UI selection in asset forms

### Indonesian Localization

1. Add locale files in `src/locales/`
2. Update date/currency formatting
3. Add Indonesian-specific validation rules

## Troubleshooting

### Common Issues

#### Database Connection

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### Migration Issues

```bash
# Reset database (development only)
npm run db:reset-force

# Check migration status
npx prisma migrate status
```

#### Build Errors

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

### Performance Optimization

#### Database Indexes

- Company ID indexes on all tables
- Asset number unique indexes
- Search indexes on asset names/descriptions

#### Caching Strategy

- Redis for session storage
- Database query result caching
- Static asset caching

## Monitoring & Analytics

### Health Checks

```bash
# Application health
npm run health:check

# Database health
npm run db:status
```

### Performance Monitoring

```bash
# Bundle analysis
npm run performance:analyze

# Lighthouse audit
npm run performance:lighthouse
```

### Security Auditing

```bash
# Security vulnerability check
npm run security:check

# Fix security issues
npm run security:fix
```

## Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Database backup and security updates
2. **Monthly**: Performance review and optimization
3. **Quarterly**: Compliance audit and reporting
4. **Annually**: Full security assessment

### Backup Strategy

- Daily automated database backups
- Weekly full system backups
- Monthly backup verification
- Disaster recovery testing

### Monitoring Alerts

- Database performance degradation
- Failed authentication attempts
- Compliance violations
- System errors and exceptions

---

## Next Steps

1. **Complete API Implementation**: Finish all CRUD operations
2. **Mobile App Integration**: QR code scanning and offline capabilities
3. **Advanced Reporting**: Custom report builder
4. **Integration APIs**: Connect with accounting systems
5. **Advanced Analytics**: Asset utilization and cost optimization

For technical support or customization requests, please contact the development team.
