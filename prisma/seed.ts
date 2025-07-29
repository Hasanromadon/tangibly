import { hashPassword } from "@/lib/auth-utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting asset management seed...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.assetMovement.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.maintenanceType.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.location.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create demo companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "PT Teknologi Maju Indonesia",
        code: "TMI",
        address: "Jl. Sudirman No. 123",
        city: "Jakarta",
        province: "DKI Jakarta",
        postalCode: "12190",
        country: "Indonesia",
        phone: "+62-21-12345678",
        email: "info@teknomai.co.id",
        website: "https://teknomai.co.id",
        taxId: "01.234.567.8-901.000", // NPWP format
        industry: "Technology",
        settings: {
          timezone: "Asia/Jakarta",
          currency: "IDR",
          locale: "id-ID",
          fiscalYearStart: "01-01",
          defaultDepreciationMethod: "straight_line",
          auditEnabled: true,
          notificationsEnabled: true,
        },
        subscriptionPlan: "enterprise",
        subscriptionExpiresAt: new Date("2026-12-31"),
      },
    }),
    prisma.company.create({
      data: {
        name: "CV Berkah Sejahtera",
        code: "BRS",
        address: "Jl. Malioboro No. 456",
        city: "Yogyakarta",
        province: "Daerah Istimewa Yogyakarta",
        postalCode: "55271",
        country: "Indonesia",
        phone: "+62-274-87654321",
        email: "contact@berkahsejahtera.co.id",
        taxId: "02.345.678.9-012.000",
        industry: "Manufacturing",
        settings: {
          timezone: "Asia/Jakarta",
          currency: "IDR",
          locale: "id-ID",
          fiscalYearStart: "01-01",
          defaultDepreciationMethod: "straight_line",
          auditEnabled: true,
          notificationsEnabled: true,
        },
        subscriptionPlan: "professional",
        subscriptionExpiresAt: new Date("2026-06-30"),
      },
    }),
  ]);

  // Create demo users
  const users = await Promise.all([
    // TMI Users
    prisma.user.create({
      data: {
        companyId: companies[0].id,
        employeeId: "TMI001",
        email: "admin@teknomai.co.id",
        passwordHash: await hashPassword("password123"),
        firstName: "Budi",
        lastName: "Santoso",
        phone: "+62-812-3456-7890",
        department: "IT",
        position: "IT Manager",
        role: "admin",
        permissions: [
          "asset_read",
          "asset_write",
          "asset_delete",
          "user_manage",
        ],
        isActive: true,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        companyId: companies[0].id,
        employeeId: "TMI002",
        email: "user@teknomai.co.id",
        passwordHash: await hashPassword("password123"),
        firstName: "Siti",
        lastName: "Rahayu",
        phone: "+62-813-4567-8901",
        department: "Operations",
        position: "Asset Coordinator",
        role: "user",
        permissions: ["asset_read", "asset_write"],
        isActive: true,
        emailVerifiedAt: new Date(),
      },
    }),
    // BRS Users
    prisma.user.create({
      data: {
        companyId: companies[1].id,
        employeeId: "BRS001",
        email: "admin@berkahsejahtera.co.id",
        passwordHash: await hashPassword("password123"),
        firstName: "Ahmad",
        lastName: "Wijaya",
        phone: "+62-814-5678-9012",
        department: "Management",
        position: "General Manager",
        role: "admin",
        permissions: [
          "asset_read",
          "asset_write",
          "asset_delete",
          "user_manage",
        ],
        isActive: true,
        emailVerifiedAt: new Date(),
      },
    }),
  ]);

  // Create asset categories
  const categories = await Promise.all([
    // TMI Categories
    prisma.assetCategory.create({
      data: {
        companyId: companies[0].id,
        name: "IT Equipment",
        code: "IT",
        description: "Computers, laptops, servers, and IT hardware",
        icon: "laptop",
        color: "#3B82F6",
        depreciationMethod: "straight_line",
        usefulLifeYears: 4,
        salvageValuePercentage: 10,
        isItAsset: true,
        isEnvironmentalAsset: false,
        sortOrder: 1,
      },
    }),
    prisma.assetCategory.create({
      data: {
        companyId: companies[0].id,
        name: "Office Furniture",
        code: "FUR",
        description: "Desks, chairs, cabinets, and office furniture",
        icon: "chair",
        color: "#10B981",
        depreciationMethod: "straight_line",
        usefulLifeYears: 8,
        salvageValuePercentage: 5,
        isItAsset: false,
        isEnvironmentalAsset: false,
        sortOrder: 2,
      },
    }),
    prisma.assetCategory.create({
      data: {
        companyId: companies[0].id,
        name: "Vehicles",
        code: "VEH",
        description: "Cars, motorcycles, and company vehicles",
        icon: "car",
        color: "#F59E0B",
        depreciationMethod: "declining_balance",
        usefulLifeYears: 8,
        salvageValuePercentage: 15,
        isItAsset: false,
        isEnvironmentalAsset: true,
        sortOrder: 3,
      },
    }),
    // BRS Categories
    prisma.assetCategory.create({
      data: {
        companyId: companies[1].id,
        name: "Production Machinery",
        code: "MAC",
        description: "Manufacturing equipment and machinery",
        icon: "cog",
        color: "#8B5CF6",
        depreciationMethod: "units_of_production",
        usefulLifeYears: 10,
        salvageValuePercentage: 10,
        isItAsset: false,
        isEnvironmentalAsset: true,
        sortOrder: 1,
      },
    }),
  ]);

  // Create locations
  const locations = await Promise.all([
    // TMI Locations
    prisma.location.create({
      data: {
        companyId: companies[0].id,
        name: "Jakarta Head Office",
        code: "JKT-HO",
        description: "Main office building in Jakarta",
        address: "Jl. Sudirman No. 123",
        city: "Jakarta",
        province: "DKI Jakarta",
        postalCode: "12190",
        coordinates: "-6.2088,106.8456", // Jakarta coordinates
        contactPerson: "Receptionist",
        contactPhone: "+62-21-12345678",
        contactEmail: "reception@teknomai.co.id",
      },
    }),
    prisma.location.create({
      data: {
        companyId: companies[0].id,
        name: "Surabaya Branch",
        code: "SBY-BR",
        description: "Branch office in Surabaya",
        address: "Jl. Pemuda No. 789",
        city: "Surabaya",
        province: "Jawa Timur",
        postalCode: "60271",
        coordinates: "-7.2575,112.7521", // Surabaya coordinates
        contactPerson: "Branch Manager",
        contactPhone: "+62-31-87654321",
        contactEmail: "surabaya@teknomai.co.id",
      },
    }),
    // BRS Locations
    prisma.location.create({
      data: {
        companyId: companies[1].id,
        name: "Yogyakarta Factory",
        code: "YGY-FAC",
        description: "Main production facility",
        address: "Jl. Malioboro No. 456",
        city: "Yogyakarta",
        province: "Daerah Istimewa Yogyakarta",
        postalCode: "55271",
        coordinates: "-7.7956,110.3695", // Yogyakarta coordinates
        contactPerson: "Factory Manager",
        contactPhone: "+62-274-87654321",
        contactEmail: "factory@berkahsejahtera.co.id",
      },
    }),
  ]);

  // Create vendors
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        companyId: companies[0].id,
        name: "PT Dell Indonesia",
        code: "DELL",
        type: "supplier",
        address: "Jl. Casablanca No. 88",
        city: "Jakarta",
        province: "DKI Jakarta",
        country: "Indonesia",
        phone: "+62-21-29345678",
        email: "sales@dell.co.id",
        website: "https://dell.co.id",
        taxId: "03.456.789.0-123.000",
        contactPerson: "Sales Manager",
        contactPhone: "+62-21-29345678",
        contactEmail: "sales@dell.co.id",
        paymentTerms: "NET 30",
        rating: 5,
        notes: "Reliable IT equipment supplier",
      },
    }),
    prisma.vendor.create({
      data: {
        companyId: companies[0].id,
        name: "CV Furniture Jaya",
        code: "FURJY",
        type: "supplier",
        address: "Jl. Industri No. 123",
        city: "Surabaya",
        province: "Jawa Timur",
        country: "Indonesia",
        phone: "+62-31-12345678",
        email: "info@furniturejaya.co.id",
        taxId: "04.567.890.1-234.000",
        contactPerson: "Owner",
        contactPhone: "+62-31-12345678",
        contactEmail: "owner@furniturejaya.co.id",
        paymentTerms: "NET 14",
        rating: 4,
        notes: "Quality office furniture manufacturer",
      },
    }),
  ]);

  // Create maintenance types
  const maintenanceTypes = await Promise.all([
    prisma.maintenanceType.create({
      data: {
        companyId: companies[0].id,
        name: "Computer Maintenance",
        description: "Regular computer cleaning and software updates",
        category: "preventive",
        defaultFrequencyDays: 90,
        estimatedDurationHours: 2,
        defaultCost: 500000, // 500k IDR
        requiredSkills: ["Computer repair", "Software installation"],
        safetyRequirements: ["ESD protection", "Clean workspace"],
      },
    }),
    prisma.maintenanceType.create({
      data: {
        companyId: companies[0].id,
        name: "Vehicle Service",
        description: "Regular vehicle maintenance and inspection",
        category: "preventive",
        defaultFrequencyDays: 90,
        estimatedDurationHours: 4,
        defaultCost: 1500000, // 1.5M IDR
        requiredSkills: ["Automotive repair", "Inspection"],
        safetyRequirements: ["Safety gear", "Proper tools"],
      },
    }),
  ]);

  // Create sample assets
  const assets = await Promise.all([
    // TMI Assets
    prisma.asset.create({
      data: {
        companyId: companies[0].id,
        assetNumber: "IT-2025-0001",
        name: "Dell Latitude 5520 - Budi Santoso",
        description: "Laptop for IT Manager",
        categoryId: categories[0].id,
        locationId: locations[0].id,
        vendorId: vendors[0].id,
        assignedTo: users[0].id,
        brand: "Dell",
        model: "Latitude 5520",
        serialNumber: "DL5520230001",
        barcode: "1234567890123",
        qrCode: JSON.stringify({
          assetNumber: "IT-2025-0001",
          name: "Dell Latitude 5520",
          category: "IT Equipment",
          location: "Jakarta Head Office",
        }),
        purchaseCost: 15000000, // 15M IDR
        purchaseDate: new Date("2024-01-15"),
        purchaseOrderNumber: "PO-2024-0001",
        invoiceNumber: "INV-DELL-0001",
        warrantyExpiresAt: new Date("2027-01-15"),
        depreciationMethod: "straight_line",
        usefulLifeYears: 4,
        salvageValue: 1500000,
        accumulatedDepreciation: 0,
        bookValue: 15000000,
        status: "active",
        condition: "excellent",
        criticality: "high",
        // IT Asset fields
        ipAddress: "192.168.1.100",
        macAddress: "00:11:22:33:44:55",
        operatingSystem: "Windows 11 Pro",
        softwareLicenses: ["Windows 11 Pro", "Microsoft Office 365"],
        securityClassification: "internal",
        images: ["/assets/laptop-dell-5520.jpg"],
        documents: ["/documents/warranty-dell-5520.pdf"],
        lastAuditDate: new Date("2024-12-01"),
        nextAuditDate: new Date("2025-12-01"),
        complianceStatus: "compliant",
        tags: ["laptop", "dell", "windows"],
        customFields: {
          ramSize: "16GB",
          storageSize: "512GB SSD",
          screenSize: "15.6 inch",
        },
        notes: "Primary laptop for IT Manager",
        createdBy: users[0].id,
      },
    }),
    prisma.asset.create({
      data: {
        companyId: companies[0].id,
        assetNumber: "VEH-2025-0001",
        name: "Toyota Avanza 2024",
        description: "Company vehicle for operational use",
        categoryId: categories[2].id,
        locationId: locations[0].id,
        brand: "Toyota",
        model: "Avanza 1.3 G MT",
        serialNumber: "TOY24AVZ001",
        barcode: "2345678901234",
        qrCode: JSON.stringify({
          assetNumber: "VEH-2025-0001",
          name: "Toyota Avanza 2024",
          category: "Vehicles",
          location: "Jakarta Head Office",
        }),
        purchaseCost: 220000000, // 220M IDR
        purchaseDate: new Date("2024-03-01"),
        purchaseOrderNumber: "PO-2024-0003",
        invoiceNumber: "INV-TOY-0001",
        warrantyExpiresAt: new Date("2027-03-01"),
        depreciationMethod: "declining_balance",
        usefulLifeYears: 8,
        salvageValue: 33000000,
        accumulatedDepreciation: 0,
        bookValue: 220000000,
        status: "active",
        condition: "excellent",
        criticality: "medium",
        // Environmental fields
        energyRating: "Euro 4",
        carbonFootprint: 2.5,
        recyclable: true,
        hazardousMaterials: ["Battery acid", "Engine oil"],
        images: ["/assets/toyota-avanza-2024.jpg"],
        documents: [
          "/documents/stnk-avanza.pdf",
          "/documents/insurance-avanza.pdf",
        ],
        lastAuditDate: new Date("2024-11-01"),
        nextAuditDate: new Date("2025-11-01"),
        complianceStatus: "compliant",
        tags: ["vehicle", "toyota", "avanza"],
        customFields: {
          plateNumber: "B 1234 ABC",
          engineCapacity: "1.3L",
          fuelType: "Gasoline",
          seatingCapacity: "7 seats",
        },
        notes: "Company operational vehicle",
        createdBy: users[0].id,
      },
    }),
    // BRS Assets
    prisma.asset.create({
      data: {
        companyId: companies[1].id,
        assetNumber: "MAC-2025-0001",
        name: "CNC Milling Machine Type A",
        description: "High precision CNC milling machine",
        categoryId: categories[3].id,
        locationId: locations[2].id,
        brand: "Haas",
        model: "VF-2SS",
        serialNumber: "HAAS24VF001",
        barcode: "3456789012345",
        qrCode: JSON.stringify({
          assetNumber: "MAC-2025-0001",
          name: "CNC Milling Machine",
          category: "Production Machinery",
          location: "Yogyakarta Factory",
        }),
        purchaseCost: 850000000, // 850M IDR
        purchaseDate: new Date("2024-02-01"),
        purchaseOrderNumber: "PO-2024-0002",
        invoiceNumber: "INV-HAAS-0001",
        warrantyExpiresAt: new Date("2026-02-01"),
        depreciationMethod: "units_of_production",
        usefulLifeYears: 10,
        salvageValue: 85000000,
        accumulatedDepreciation: 0,
        bookValue: 850000000,
        status: "active",
        condition: "excellent",
        criticality: "critical",
        // Environmental fields
        energyRating: "A",
        carbonFootprint: 15.5,
        recyclable: true,
        hazardousMaterials: ["Hydraulic fluid", "Cutting fluid"],
        images: ["/assets/cnc-milling-haas.jpg"],
        documents: [
          "/documents/manual-cnc-haas.pdf",
          "/documents/calibration-cert.pdf",
        ],
        lastAuditDate: new Date("2024-10-01"),
        nextAuditDate: new Date("2025-10-01"),
        complianceStatus: "compliant",
        tags: ["cnc", "milling", "production"],
        customFields: {
          maxSpindleSpeed: "15000 RPM",
          workingArea: "762 x 406 x 508 mm",
          powerConsumption: "15 kW",
          weight: "2800 kg",
        },
        notes: "Primary production machine for precision parts",
        createdBy: users[2].id,
      },
    }),
  ]);

  // Create work orders
  const workOrders = await Promise.all([
    prisma.workOrder.create({
      data: {
        companyId: companies[0].id,
        workOrderNumber: "WO-2025-0001",
        assetId: assets[0].id,
        maintenanceTypeId: maintenanceTypes[0].id,
        title: "Quarterly Computer Maintenance - Dell Latitude 5520",
        description:
          "Regular quarterly maintenance including cleaning, software updates, and performance check",
        priority: "medium",
        status: "completed",
        scheduledDate: new Date("2024-12-15T09:00:00Z"),
        startedAt: new Date("2024-12-15T09:15:00Z"),
        completedAt: new Date("2024-12-15T11:00:00Z"),
        estimatedHours: 2,
        actualHours: 1.75,
        assignedTo: users[1].id,
        estimatedCost: 500000,
        actualCost: 450000,
        laborCost: 300000,
        partsCost: 150000,
        completionNotes:
          "Maintenance completed successfully. System performance improved. Recommended memory upgrade for better performance.",
        partsUsed: [
          {
            partNumber: "CLN-001",
            description: "Computer cleaning kit",
            quantity: 1,
            unitCost: 150000,
            totalCost: 150000,
          },
        ],
        completionPhotos: [
          "/photos/wo-2025-0001-before.jpg",
          "/photos/wo-2025-0001-after.jpg",
        ],
        createdBy: users[0].id,
        updatedBy: users[1].id,
      },
    }),
    prisma.workOrder.create({
      data: {
        companyId: companies[0].id,
        workOrderNumber: "WO-2025-0002",
        assetId: assets[1].id,
        maintenanceTypeId: maintenanceTypes[1].id,
        title: "Vehicle Service - Toyota Avanza",
        description:
          "Regular 3-month vehicle service including oil change, filter replacement, and general inspection",
        priority: "high",
        status: "open",
        scheduledDate: new Date("2025-01-30T08:00:00Z"),
        estimatedHours: 4,
        assignedTo: users[1].id,
        estimatedCost: 1500000,
        createdBy: users[0].id,
      },
    }),
  ]);

  // Create asset movements
  const movements = await Promise.all([
    prisma.assetMovement.create({
      data: {
        companyId: companies[0].id,
        assetId: assets[0].id,
        movementType: "transfer",
        fromLocationId: locations[1].id, // From Surabaya
        toLocationId: locations[0].id, // To Jakarta
        toUserId: users[0].id,
        movementDate: new Date("2024-11-15T10:00:00Z"),
        reason: "User relocation to Jakarta office",
        approvalStatus: "approved",
        approvedBy: users[0].id,
        approvedAt: new Date("2024-11-14T15:30:00Z"),
        createdBy: users[1].id,
      },
    }),
  ]);

  // Create audit logs for compliance
  await Promise.all([
    prisma.auditLog.create({
      data: {
        companyId: companies[0].id,
        userId: users[0].id,
        entityType: "asset",
        entityId: assets[0].id,
        action: "create",
        newValues: {
          assetNumber: "IT-2025-0001",
          name: "Dell Latitude 5520 - Budi Santoso",
          status: "active",
        },
        ipAddress: "192.168.1.50",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "sess_123456789",
        complianceEvent: true,
      },
    }),
    prisma.auditLog.create({
      data: {
        companyId: companies[0].id,
        userId: users[1].id,
        entityType: "workOrder",
        entityId: workOrders[0].id,
        action: "update",
        oldValues: { status: "in_progress" },
        newValues: { status: "completed" },
        ipAddress: "192.168.1.51",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "sess_987654321",
        complianceEvent: false,
      },
    }),
  ]);

  console.log("✅ Asset management seed completed successfully!");
  console.log(`📊 Created:`);
  console.log(`   - ${companies.length} companies`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${categories.length} asset categories`);
  console.log(`   - ${locations.length} locations`);
  console.log(`   - ${vendors.length} vendors`);
  console.log(`   - ${maintenanceTypes.length} maintenance types`);
  console.log(`   - ${assets.length} assets`);
  console.log(`   - ${workOrders.length} work orders`);
  console.log(`   - ${movements.length} asset movements`);
  console.log(`   - 2 audit log entries`);

  console.log(`\n🔐 Demo Login Credentials:`);
  console.log(`   TMI Admin: admin@teknomai.co.id / password123`);
  console.log(`   TMI User:  user@teknomai.co.id / password123`);
  console.log(`   BRS Admin: admin@berkahsejahtera.co.id / password123`);
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
