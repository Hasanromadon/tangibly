-- Asset Management Database Schema
-- Compliant with ISO standards and Indonesian regulations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Companies (Multi-tenant)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- Company identifier
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Indonesia',
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    tax_id VARCHAR(50), -- NPWP for Indonesian companies
    industry VARCHAR(100),
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'starter',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users with multi-tenant support
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id VARCHAR(50), -- Company employee ID
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- super_admin, admin, manager, user, viewer
    permissions JSONB DEFAULT '[]',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Categories (ISO 27001 compliant)
CREATE TABLE asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    depreciation_method VARCHAR(50) DEFAULT 'straight_line', -- straight_line, declining_balance
    useful_life_years INTEGER,
    salvage_value_percentage DECIMAL(5,2) DEFAULT 0,
    is_it_asset BOOLEAN DEFAULT false, -- ISO 27001 IT assets
    is_environmental_asset BOOLEAN DEFAULT false, -- ISO 14001 assets
    parent_id UUID REFERENCES asset_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- Locations/Sites
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    coordinates POINT, -- GPS coordinates
    contact_person VARCHAR(100),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    parent_id UUID REFERENCES locations(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- Vendors/Suppliers
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(50), -- supplier, contractor, service_provider
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    tax_id VARCHAR(50), -- NPWP
    contact_person VARCHAR(100),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    payment_terms VARCHAR(100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- Main Assets Table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    asset_number VARCHAR(100) UNIQUE NOT NULL, -- Auto-generated or manual
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES asset_categories(id),
    location_id UUID REFERENCES locations(id),
    vendor_id UUID REFERENCES vendors(id),
    assigned_to UUID REFERENCES users(id),
    
    -- Asset Details
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    barcode VARCHAR(100),
    qr_code VARCHAR(255), -- QR code data
    
    -- Financial Information (Indonesian PSAK standards)
    purchase_cost DECIMAL(15,2),
    purchase_date DATE,
    purchase_order_number VARCHAR(100),
    invoice_number VARCHAR(100),
    warranty_expires_at DATE,
    
    -- Depreciation (PSAK 16 compliant)
    depreciation_method VARCHAR(50) DEFAULT 'straight_line',
    useful_life_years INTEGER,
    salvage_value DECIMAL(15,2) DEFAULT 0,
    accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
    book_value DECIMAL(15,2),
    
    -- Status and Lifecycle
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, maintenance, disposed, stolen, lost
    condition VARCHAR(50) DEFAULT 'good', -- excellent, good, fair, poor, damaged
    criticality VARCHAR(50) DEFAULT 'medium', -- critical, high, medium, low
    
    -- Environmental (ISO 14001)
    energy_rating VARCHAR(20),
    carbon_footprint DECIMAL(10,3),
    recyclable BOOLEAN DEFAULT false,
    hazardous_materials TEXT[],
    
    -- IT Asset specific (ISO 27001)
    ip_address INET,
    mac_address VARCHAR(17),
    operating_system VARCHAR(100),
    software_licenses TEXT[],
    security_classification VARCHAR(50), -- public, internal, confidential, restricted
    
    -- Images and Documents
    images TEXT[], -- Array of image URLs
    documents TEXT[], -- Array of document URLs
    
    -- Compliance
    last_audit_date DATE,
    next_audit_date DATE,
    compliance_status VARCHAR(50) DEFAULT 'compliant', -- compliant, non_compliant, pending
    
    -- Metadata
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,
    
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Movements/Transfers
CREATE TABLE asset_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- transfer, loan, return, disposal, found, stolen
    
    from_location_id UUID REFERENCES locations(id),
    to_location_id UUID REFERENCES locations(id),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,
    approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Management
CREATE TABLE maintenance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- preventive, corrective, predictive
    default_frequency_days INTEGER,
    estimated_duration_hours DECIMAL(5,2),
    default_cost DECIMAL(12,2),
    required_skills TEXT[],
    safety_requirements TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Orders
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    work_order_number VARCHAR(100) UNIQUE NOT NULL,
    asset_id UUID REFERENCES assets(id),
    maintenance_type_id UUID REFERENCES maintenance_types(id),
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium', -- critical, high, medium, low
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, completed, cancelled, on_hold
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_team TEXT[],
    vendor_id UUID REFERENCES vendors(id),
    
    -- Costs
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    labor_cost DECIMAL(12,2),
    parts_cost DECIMAL(12,2),
    vendor_cost DECIMAL(12,2),
    
    -- Completion Details
    completion_notes TEXT,
    parts_used JSONB DEFAULT '[]',
    completion_photos TEXT[],
    
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs (ISO compliance)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL, -- asset, user, company, etc.
    entity_id UUID,
    action VARCHAR(50) NOT NULL, -- create, update, delete, view, export
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    compliance_event BOOLEAN DEFAULT false, -- Mark ISO compliance events
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_assets_company_id ON assets(company_id);
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_location_id ON assets(location_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_asset_number ON assets(asset_number);
CREATE INDEX idx_work_orders_asset_id ON work_orders(asset_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security (RLS) for multi-tenancy
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be created in separate migration files
