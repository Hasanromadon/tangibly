/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import ViewAssetDialog from "../ViewAssetDialog";
import { Asset } from "@/types/entities";
import enMessages from "@/messages/en.json";

// Mock asset data
const mockAsset: Asset = {
  id: "asset-1",
  companyId: "company-1",
  assetNumber: "AST-001",
  name: "Dell Laptop OptiPlex 7090",
  description: "High-performance laptop for development work",
  brand: "Dell",
  model: "OptiPlex 7090",
  serialNumber: "DL123456789",
  barcode: "123456789012",
  categoryId: "cat-1",
  locationId: "loc-1",
  assignedTo: "user-1",
  purchaseCost: 15000000,
  purchaseDate: "2024-01-15",
  purchaseOrderNumber: "PO-2024-001",
  invoiceNumber: "INV-2024-001",
  warrantyExpiresAt: "2027-01-15",
  depreciationMethod: "straight_line",
  usefulLifeYears: 5,
  salvageValue: 1000000,
  bookValue: 12000000,
  status: "active",
  condition: "excellent",
  criticality: "high",
  energyRating: "A+",
  carbonFootprint: 500,
  recyclable: true,
  hazardousMaterials: [],
  ipAddress: "192.168.1.100",
  macAddress: "00:1B:44:11:3A:B7",
  operatingSystem: "Windows 11 Pro",
  softwareLicenses: ["Microsoft Office 365", "Visual Studio Professional"],
  securityClassification: "internal",
  qrCode: "QR123456",
  tags: ["development", "laptop"],
  customFields: {},
  notes: "Primary development machine for senior developer",
  category: {
    id: "cat-1",
    name: "IT Equipment",

    icon: "monitor",
    color: "#3B82F6",
    companyId: "company-1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  location: {
    id: "loc-1",
    name: "Jakarta Office - Floor 3",
    address: "Jl. Sudirman No. 123",

    city: "Jakarta",
    province: "DKI Jakarta",
    postalCode: "12345",
    country: "Indonesia",

    companyId: "company-1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  assignee: {
    id: "user-1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    role: "USER",
    companyId: "company-1",
    employeeId: "EMP001",
    isActive: true,
    emailVerified: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  createdBy: "admin-1",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-15",
};

// Test wrapper with required providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="en" messages={enMessages}>
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
};

describe("ViewAssetDialog", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders correctly when open with asset data", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    // Check if the asset name is displayed in the title
    expect(screen.getByText("Dell Laptop OptiPlex 7090")).toBeInTheDocument();

    // Check if status badges are displayed
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Excellent")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();

    // Check if tabs are rendered
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Financial")).toBeInTheDocument();
    expect(screen.getByText("Technical")).toBeInTheDocument();
    expect(screen.getByText("Maintenance")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={false} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    expect(
      screen.queryByText("Dell Laptop OptiPlex 7090")
    ).not.toBeInTheDocument();
  });

  it("does not render when asset is null", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={null} />
      </TestWrapper>
    );

    expect(
      screen.queryByText("Dell Laptop OptiPlex 7090")
    ).not.toBeInTheDocument();
  });

  it("displays basic information correctly", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    // Check basic information fields
    expect(screen.getByText("Dell")).toBeInTheDocument();
    expect(screen.getByText("OptiPlex 7090")).toBeInTheDocument();
    expect(screen.getByText("DL123456789")).toBeInTheDocument();
    expect(screen.getByText("123456789012")).toBeInTheDocument();
    expect(screen.getByText("IT Equipment")).toBeInTheDocument();
  });

  it("displays location and assignment information", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    expect(screen.getByText("Jakarta Office - Floor 3")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("displays financial information when switching to financial tab", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    // Click on Financial tab
    fireEvent.click(screen.getByText("Financial"));

    // Check if financial information is displayed
    expect(screen.getByText("Rp15.000.000,00")).toBeInTheDocument();
    expect(screen.getByText("PO-2024-001")).toBeInTheDocument();
    expect(screen.getByText("INV-2024-001")).toBeInTheDocument();
    expect(screen.getByText("5 years")).toBeInTheDocument();
  });

  it("displays technical information when switching to technical tab", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    // Click on Technical tab
    fireEvent.click(screen.getByText("Technical"));

    // Check if IT information is displayed
    expect(screen.getByText("192.168.1.100")).toBeInTheDocument();
    expect(screen.getByText("00:1B:44:11:3A:B7")).toBeInTheDocument();
    expect(screen.getByText("Windows 11 Pro")).toBeInTheDocument();
    expect(screen.getByText("Microsoft Office 365")).toBeInTheDocument();
    expect(screen.getByText("Visual Studio Professional")).toBeInTheDocument();
  });

  it("displays environmental information when available", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    // Check environmental information in overview tab
    expect(screen.getByText("A+")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument(); // recyclable
  });

  it("displays notes when available", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    expect(
      screen.getByText("Primary development machine for senior developer")
    ).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("handles missing optional fields gracefully", () => {
    const minimalAsset: Asset = {
      ...mockAsset,
      brand: undefined,
      model: undefined,
      serialNumber: undefined,
      description: undefined,
      category: undefined,
      location: undefined,
      assignee: undefined,
      notes: undefined,
    };

    render(
      <TestWrapper>
        <ViewAssetDialog
          open={true}
          onClose={mockOnClose}
          asset={minimalAsset}
        />
      </TestWrapper>
    );

    // Should display "-" for missing fields
    expect(screen.getAllByText("-")).toHaveLength(8); // Multiple "-" placeholders
  });

  it("displays formatted dates correctly", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    // Check if dates are formatted (Indonesian format)
    expect(screen.getByText("15 Januari 2024")).toBeInTheDocument(); // purchase date
    expect(screen.getByText("15 Januari 2027")).toBeInTheDocument(); // warranty expiry
  });

  it("displays currency values correctly", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    // Click on Financial tab to see currency values
    fireEvent.click(screen.getByText("Financial"));

    // Check if currencies are formatted (Indonesian Rupiah)
    expect(screen.getByText("Rp15.000.000,00")).toBeInTheDocument(); // purchase cost
    expect(screen.getByText("Rp1.000.000,00")).toBeInTheDocument(); // salvage value
    expect(screen.getByText("Rp12.000.000,00")).toBeInTheDocument(); // book value
  });

  it("shows history information in history tab", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    // Click on History tab
    fireEvent.click(screen.getByText("History"));

    // Check if history information is displayed
    expect(screen.getByText("Asset Created")).toBeInTheDocument();
    expect(screen.getByText("Asset Updated")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });

  it("shows maintenance information in maintenance tab", () => {
    render(
      <TestWrapper>
        <ViewAssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />
      </TestWrapper>
    );

    // Click on Maintenance tab
    fireEvent.click(screen.getByText("Maintenance"));

    // Check if maintenance information is displayed
    expect(screen.getByText("Maintenance Schedule")).toBeInTheDocument();
    expect(screen.getByText("No maintenance scheduled")).toBeInTheDocument();
  });
});
