# Tangibly - Modern Asset Management SAAS

## Overview

Comprehensive asset management system compliant with ISO 27001, ISO 14001, and Indonesian regulations for enterprise asset tracking, maintenance, and lifecycle management.

## Key Features

### 🏢 **Multi-Tenant SAAS Architecture**

- Company-specific workspaces
- Role-based access control (RBAC)
- White-label customization
- API-first design

### 📋 **Asset Management Core**

- Asset registration & categorization
- QR/Barcode generation & scanning
- Asset lifecycle tracking
- Depreciation calculation (Indonesian PSAK standards)
- Asset transfer & disposal workflows

### 🔧 **Maintenance Management**

- Preventive maintenance scheduling
- Work order management
- Maintenance history tracking
- Spare parts inventory
- Vendor management

### 📊 **Compliance & Reporting**

- ISO 27001 IT asset compliance
- ISO 14001 environmental tracking
- Indonesian tax depreciation reports
- Audit trail & documentation
- Custom report builder

### 📱 **Mobile-First Design**

- Progressive Web App (PWA)
- Offline capability
- Mobile asset scanning
- Field maintenance reports

### 🔐 **Security & Privacy**

- End-to-end encryption
- GDPR/Indonesian data protection compliance
- Multi-factor authentication
- API rate limiting

## Technical Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with multi-tenancy
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 compatible
- **Monitoring**: Real-time error tracking
- **Deployment**: Docker, Vercel/AWS

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Main dashboard
│   ├── (admin)/                  # Super admin panel
│   ├── api/                      # API endpoints
│   └── (public)/                 # Public pages
├── components/                   # Reusable UI components
├── lib/                         # Utilities and configurations
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript type definitions
├── utils/                       # Helper functions
├── constants/                   # Application constants
├── schemas/                     # Validation schemas
└── middleware/                  # Custom middleware
```

## ISO Compliance Standards

### ISO 27001 - Information Security

- Asset inventory management
- Risk assessment workflows
- Incident response tracking
- Access control matrices

### ISO 14001 - Environmental Management

- Environmental impact tracking
- Waste management
- Energy consumption monitoring
- Carbon footprint calculation

### Indonesian Regulations

- PSAK 16 - Property, Plant & Equipment
- PMK-96/2009 - Asset depreciation
- UU No. 8/1983 - Tax regulations
- POJK regulations for financial reporting
