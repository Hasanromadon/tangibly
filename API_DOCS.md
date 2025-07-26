# Asset Management API Documentation

This document provides comprehensive documentation for the SAAS Asset Management System API endpoints.

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@teknomai.co.id",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@teknomai.co.id",
    "firstName": "Budi",
    "lastName": "Santoso",
    "role": "admin",
    "companyId": "uuid"
  }
}
```

## Company Management

### Get Current Company

```http
GET /api/companies/current
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "name": "PT Teknologi Maju Indonesia",
  "code": "TMI",
  "industry": "Technology",
  "settings": {
    "timezone": "Asia/Jakarta",
    "currency": "IDR",
    "locale": "id-ID"
  }
}
```

### Update Company Settings

```http
PUT /api/companies/current/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "timezone": "Asia/Jakarta",
  "currency": "IDR",
  "defaultDepreciationMethod": "straight_line",
  "auditEnabled": true
}

Response:
{
  "message": "Settings updated successfully",
  "settings": { ... }
}
```

### Get Company Statistics

```http
GET /api/companies/current/stats
Authorization: Bearer <token>

Response:
{
  "totalAssets": 156,
  "totalValue": 2500000000,
  "activeAssets": 142,
  "maintenanceDue": 8,
  "complianceIssues": 2,
  "assetsByCategory": [
    { "category": "IT Equipment", "count": 89, "value": 1200000000 },
    { "category": "Vehicles", "count": 12, "value": 800000000 }
  ]
}
```

## Asset Management

### List Assets

```http
GET /api/assets?page=1&limit=20&category=IT&status=active&search=laptop
Authorization: Bearer <token>

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20, max: 100)
- category: Filter by category ID or name
- status: active, inactive, maintenance, disposed
- condition: excellent, good, fair, poor
- location: Filter by location ID
- assignedTo: Filter by user ID
- search: Search in name, description, serial number
- sort: name, purchaseDate, bookValue, status
- order: asc, desc

Response:
{
  "assets": [
    {
      "id": "uuid",
      "assetNumber": "IT-2025-0001",
      "name": "Dell Latitude 5520 - Budi Santoso",
      "description": "Laptop for IT Manager",
      "category": {
        "id": "uuid",
        "name": "IT Equipment",
        "code": "IT"
      },
      "location": {
        "id": "uuid",
        "name": "Jakarta Head Office",
        "code": "JKT-HO"
      },
      "assignedTo": {
        "id": "uuid",
        "firstName": "Budi",
        "lastName": "Santoso"
      },
      "purchaseCost": 15000000,
      "bookValue": 12500000,
      "status": "active",
      "condition": "excellent",
      "qrCode": "...",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### Get Asset Details

```http
GET /api/assets/[id]
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "assetNumber": "IT-2025-0001",
  "name": "Dell Latitude 5520",
  "description": "Laptop for IT Manager",
  "category": { ... },
  "location": { ... },
  "vendor": { ... },
  "assignedTo": { ... },
  "brand": "Dell",
  "model": "Latitude 5520",
  "serialNumber": "DL5520230001",
  "barcode": "1234567890123",
  "qrCode": "{\"assetNumber\":\"IT-2025-0001\"}",
  "purchaseCost": 15000000,
  "purchaseDate": "2024-01-15",
  "warrantyExpiresAt": "2027-01-15",
  "depreciationMethod": "straight_line",
  "usefulLifeYears": 4,
  "salvageValue": 1500000,
  "accumulatedDepreciation": 2500000,
  "bookValue": 12500000,
  "status": "active",
  "condition": "excellent",
  "criticality": "high",
  "ipAddress": "192.168.1.100",
  "macAddress": "00:11:22:33:44:55",
  "operatingSystem": "Windows 11 Pro",
  "softwareLicenses": ["Windows 11 Pro", "Microsoft Office 365"],
  "securityClassification": "internal",
  "images": ["/assets/laptop-dell-5520.jpg"],
  "documents": ["/documents/warranty-dell-5520.pdf"],
  "lastAuditDate": "2024-12-01",
  "nextAuditDate": "2025-12-01",
  "complianceStatus": "compliant",
  "tags": ["laptop", "dell", "windows"],
  "customFields": {
    "ramSize": "16GB",
    "storageSize": "512GB SSD"
  },
  "notes": "Primary laptop for IT Manager",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-12-01T15:30:00Z"
}
```

### Create Asset

```http
POST /api/assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "MacBook Pro 14-inch",
  "description": "Design team laptop",
  "categoryId": "uuid",
  "locationId": "uuid",
  "vendorId": "uuid",
  "assignedTo": "uuid",
  "brand": "Apple",
  "model": "MacBook Pro 14",
  "serialNumber": "APPLE2024001",
  "purchaseCost": 35000000,
  "purchaseDate": "2024-01-20",
  "warrantyExpiresAt": "2027-01-20",
  "condition": "excellent",
  "criticality": "high",
  "customFields": {
    "ramSize": "32GB",
    "storageSize": "1TB SSD",
    "processor": "M3 Pro"
  },
  "tags": ["laptop", "apple", "design"]
}

Response:
{
  "message": "Asset created successfully",
  "asset": {
    "id": "uuid",
    "assetNumber": "IT-2025-0002",
    ...
  }
}
```

### Update Asset

```http
PUT /api/assets/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "MacBook Pro 14-inch - Updated",
  "condition": "good",
  "locationId": "new-location-uuid",
  "notes": "Moved to new office"
}

Response:
{
  "message": "Asset updated successfully",
  "asset": { ... }
}
```

### Delete Asset

```http
DELETE /api/assets/[id]
Authorization: Bearer <token>

Response:
{
  "message": "Asset deleted successfully"
}
```

### Generate Asset QR Code

```http
GET /api/assets/[id]/qr-code
Authorization: Bearer <token>

Response: QR Code image (PNG format)
Content-Type: image/png
```

### Asset Movement History

```http
GET /api/assets/[id]/movements
Authorization: Bearer <token>

Response:
{
  "movements": [
    {
      "id": "uuid",
      "movementType": "transfer",
      "fromLocation": { "name": "Surabaya Branch" },
      "toLocation": { "name": "Jakarta Head Office" },
      "fromUser": { "firstName": "Siti", "lastName": "Rahayu" },
      "toUser": { "firstName": "Budi", "lastName": "Santoso" },
      "movementDate": "2024-11-15T10:00:00Z",
      "reason": "User relocation to Jakarta office",
      "approvalStatus": "approved",
      "createdBy": { ... }
    }
  ]
}
```

## Asset Categories

### List Categories

```http
GET /api/asset-categories
Authorization: Bearer <token>

Response:
{
  "categories": [
    {
      "id": "uuid",
      "name": "IT Equipment",
      "code": "IT",
      "description": "Computers, laptops, servers",
      "icon": "laptop",
      "color": "#3B82F6",
      "depreciationMethod": "straight_line",
      "usefulLifeYears": 4,
      "salvageValuePercentage": 10,
      "isItAsset": true,
      "isEnvironmentalAsset": false,
      "assetCount": 89
    }
  ]
}
```

### Create Category

```http
POST /api/asset-categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Medical Equipment",
  "code": "MED",
  "description": "Medical devices and equipment",
  "icon": "medical",
  "color": "#EF4444",
  "depreciationMethod": "straight_line",
  "usefulLifeYears": 10,
  "salvageValuePercentage": 5,
  "isItAsset": false,
  "isEnvironmentalAsset": false
}

Response:
{
  "message": "Category created successfully",
  "category": { ... }
}
```

## Location Management

### List Locations

```http
GET /api/locations
Authorization: Bearer <token>

Response:
{
  "locations": [
    {
      "id": "uuid",
      "name": "Jakarta Head Office",
      "code": "JKT-HO",
      "description": "Main office building",
      "address": "Jl. Sudirman No. 123",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "postalCode": "12190",
      "coordinates": "-6.2088,106.8456",
      "contactPerson": "Receptionist",
      "contactPhone": "+62-21-12345678",
      "assetCount": 125
    }
  ]
}
```

### Create Location

```http
POST /api/locations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bandung Branch",
  "code": "BDG-BR",
  "description": "Regional office in Bandung",
  "address": "Jl. Asia Afrika No. 456",
  "city": "Bandung",
  "province": "Jawa Barat",
  "postalCode": "40111",
  "contactPerson": "Branch Manager",
  "contactPhone": "+62-22-87654321"
}

Response:
{
  "message": "Location created successfully",
  "location": { ... }
}
```

## Vendor Management

### List Vendors

```http
GET /api/vendors?type=supplier&rating=5
Authorization: Bearer <token>

Response:
{
  "vendors": [
    {
      "id": "uuid",
      "name": "PT Dell Indonesia",
      "code": "DELL",
      "type": "supplier",
      "address": "Jl. Casablanca No. 88",
      "phone": "+62-21-29345678",
      "email": "sales@dell.co.id",
      "website": "https://dell.co.id",
      "rating": 5,
      "assetCount": 45
    }
  ]
}
```

### Create Vendor

```http
POST /api/vendors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "PT Teknologi Supplier",
  "code": "TEKSU",
  "type": "supplier",
  "address": "Jl. Industri No. 789",
  "city": "Jakarta",
  "phone": "+62-21-12345678",
  "email": "info@teknologi-supplier.co.id",
  "paymentTerms": "NET 30",
  "rating": 4
}

Response:
{
  "message": "Vendor created successfully",
  "vendor": { ... }
}
```

## Work Order Management

### List Work Orders

```http
GET /api/work-orders?status=open&priority=high&assetId=uuid
Authorization: Bearer <token>

Response:
{
  "workOrders": [
    {
      "id": "uuid",
      "workOrderNumber": "WO-2025-0002",
      "asset": {
        "assetNumber": "VEH-2025-0001",
        "name": "Toyota Avanza 2024"
      },
      "maintenanceType": {
        "name": "Vehicle Service",
        "category": "preventive"
      },
      "title": "Vehicle Service - Toyota Avanza",
      "priority": "high",
      "status": "open",
      "scheduledDate": "2025-01-30T08:00:00Z",
      "estimatedHours": 4,
      "assignedTo": {
        "firstName": "Siti",
        "lastName": "Rahayu"
      },
      "estimatedCost": 1500000
    }
  ]
}
```

### Create Work Order

```http
POST /api/work-orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "uuid",
  "maintenanceTypeId": "uuid",
  "title": "Emergency Laptop Repair",
  "description": "Screen replacement needed",
  "priority": "high",
  "scheduledDate": "2025-01-25T10:00:00Z",
  "estimatedHours": 3,
  "assignedTo": "uuid",
  "estimatedCost": 2000000
}

Response:
{
  "message": "Work order created successfully",
  "workOrder": {
    "workOrderNumber": "WO-2025-0003",
    ...
  }
}
```

### Update Work Order Status

```http
PATCH /api/work-orders/[id]/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "completionNotes": "Laptop screen replaced successfully",
  "actualHours": 2.5,
  "actualCost": 1800000,
  "partsUsed": [
    {
      "partNumber": "SCR-001",
      "description": "15.6-inch laptop screen",
      "quantity": 1,
      "unitCost": 1200000
    }
  ]
}

Response:
{
  "message": "Work order status updated successfully",
  "workOrder": { ... }
}
```

## Maintenance Types

### List Maintenance Types

```http
GET /api/maintenance-types?category=preventive
Authorization: Bearer <token>

Response:
{
  "maintenanceTypes": [
    {
      "id": "uuid",
      "name": "Computer Maintenance",
      "description": "Regular computer cleaning and updates",
      "category": "preventive",
      "defaultFrequencyDays": 90,
      "estimatedDurationHours": 2,
      "defaultCost": 500000,
      "requiredSkills": ["Computer repair"],
      "safetyRequirements": ["ESD protection"]
    }
  ]
}
```

## Asset Movements

### Create Asset Movement

```http
POST /api/asset-movements
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "uuid",
  "movementType": "transfer",
  "toLocationId": "uuid",
  "toUserId": "uuid",
  "reason": "Office relocation",
  "scheduledDate": "2025-01-30T09:00:00Z"
}

Response:
{
  "message": "Asset movement created successfully",
  "movement": {
    "id": "uuid",
    "approvalStatus": "pending",
    ...
  }
}
```

### Approve Asset Movement

```http
PATCH /api/asset-movements/[id]/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": true,
  "notes": "Movement approved for office relocation"
}

Response:
{
  "message": "Asset movement approved successfully"
}
```

## Audit Logs

### List Audit Logs

```http
GET /api/audit-logs?entityType=asset&entityId=uuid&complianceEvent=true
Authorization: Bearer <token>

Response:
{
  "auditLogs": [
    {
      "id": "uuid",
      "user": {
        "firstName": "Budi",
        "lastName": "Santoso"
      },
      "entityType": "asset",
      "entityId": "uuid",
      "action": "update",
      "oldValues": { "status": "active" },
      "newValues": { "status": "maintenance" },
      "timestamp": "2024-12-01T15:30:00Z",
      "ipAddress": "192.168.1.50",
      "complianceEvent": true
    }
  ]
}
```

## Reporting APIs

### Asset Depreciation Report

```http
GET /api/reports/depreciation?startDate=2024-01-01&endDate=2024-12-31&format=json
Authorization: Bearer <token>

Response:
{
  "reportData": {
    "totalDepreciation": 45000000,
    "assetsByCategory": [
      {
        "category": "IT Equipment",
        "totalCost": 150000000,
        "accumulatedDepreciation": 25000000,
        "bookValue": 125000000
      }
    ]
  }
}
```

### Compliance Report

```http
GET /api/reports/compliance?standard=ISO27001&status=non-compliant
Authorization: Bearer <token>

Response:
{
  "complianceData": {
    "totalAssets": 156,
    "compliantAssets": 142,
    "nonCompliantAssets": 14,
    "issues": [
      {
        "assetId": "uuid",
        "assetName": "Old Server",
        "issue": "Security classification missing",
        "severity": "high"
      }
    ]
  }
}
```

## Error Responses

All API endpoints return standardized error responses:

### Validation Error (400)

```json
{
  "error": "Validation failed",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### Forbidden (403)

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### Not Found (404)

```json
{
  "error": "Not Found",
  "message": "Asset not found"
}
```

### Server Error (500)

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Data endpoints**: 100 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

The system supports webhooks for real-time notifications:

### Asset Events

- `asset.created` - New asset added
- `asset.updated` - Asset information changed
- `asset.deleted` - Asset removed
- `asset.moved` - Asset location changed

### Maintenance Events

- `workorder.created` - New work order created
- `workorder.completed` - Work order finished
- `workorder.overdue` - Work order past due date

### Compliance Events

- `compliance.violation` - Compliance issue detected
- `audit.required` - Asset audit due

### Webhook Configuration

```http
POST /api/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://yourapp.com/webhooks/assets",
  "events": ["asset.created", "asset.updated"],
  "secret": "your-webhook-secret"
}
```

## SDK & Integration Examples

### JavaScript/Node.js

```javascript
const TangiblyAPI = require("@tangibly/api-client");

const client = new TangiblyAPI({
  baseURL: "https://api.tangibly.com",
  token: "your-jwt-token",
});

// Get assets
const assets = await client.assets.list({
  page: 1,
  limit: 20,
  category: "IT",
});

// Create asset
const newAsset = await client.assets.create({
  name: "New Laptop",
  categoryId: "uuid",
  purchaseCost: 15000000,
});
```

### Python

```python
import tangibly

client = tangibly.Client(
    base_url='https://api.tangibly.com',
    token='your-jwt-token'
)

# Get assets
assets = client.assets.list(page=1, limit=20, category='IT')

# Create asset
new_asset = client.assets.create(
    name='New Laptop',
    category_id='uuid',
    purchase_cost=15000000
)
```

For more detailed examples and SDK documentation, visit our developer portal.
