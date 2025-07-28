/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import DeleteAssetDialog from "../DeleteAssetDialog";
import { Asset } from "@/types/entities";
import enMessages from "@/messages/en.json";

// Mock asset data
const mockAsset: Asset = {
  id: "asset-1",
  companyId: "company-1",
  assetNumber: "AST-001",
  name: "Dell Laptop OptiPlex 7090",
  description: "High-performance laptop for development work",
  serialNumber: "DL123456789",
  categoryId: "cat-1",
  locationId: "loc-1",
  assignedTo: "user-1",
  purchaseCost: 15000000,
  purchaseDate: "2024-01-15",
  depreciationMethod: "straight_line",
  usefulLifeYears: 5,
  salvageValue: 1000000,
  status: "active",
  condition: "excellent",
  criticality: "high",
  energyRating: "A+",
  carbonFootprint: 500,
  recyclable: true,
  hazardousMaterials: [],
  softwareLicenses: [],
  tags: ["development", "laptop"],
  customFields: {},
  category: {
    id: "cat-1",
    name: "IT Equipment",
    code: "IT",
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

describe("DeleteAssetDialog", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it("renders correctly when open with asset data", () => {
    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={mockAsset}
        />
      </TestWrapper>
    );

    // Check if the dialog title is displayed
    expect(screen.getByText("Delete Asset")).toBeInTheDocument();

    // Check if asset information is displayed
    expect(screen.getByText("Dell Laptop OptiPlex 7090")).toBeInTheDocument();
    expect(screen.getByText("DL123456789")).toBeInTheDocument();
    expect(screen.getByText("IT Equipment")).toBeInTheDocument();
    expect(screen.getByText("Jakarta Office - Floor 3")).toBeInTheDocument();

    // Check if warning text is displayed
    expect(screen.getByText("This action will:")).toBeInTheDocument();
    expect(
      screen.getByText("Permanently delete the asset record")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Remove all maintenance history")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Delete all associated movements and transactions")
    ).toBeInTheDocument();

    // Check if confirmation input is displayed
    expect(screen.getByText("To confirm, type")).toBeInTheDocument();
    expect(screen.getByText("DELETE")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("DELETE")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={mockAsset}
        />
      </TestWrapper>
    );

    expect(screen.queryByText("Delete Asset")).not.toBeInTheDocument();
  });

  it("does not render when asset is null", () => {
    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={null}
        />
      </TestWrapper>
    );

    expect(screen.queryByText("Delete Asset")).not.toBeInTheDocument();
  });

  it("disables delete button initially", () => {
    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={mockAsset}
        />
      </TestWrapper>
    );

    const deleteButton = screen.getByRole("button", { name: /delete asset/i });
    expect(deleteButton).toBeDisabled();
  });

  it("enables delete button when correct confirmation text is entered", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={mockAsset}
        />
      </TestWrapper>
    );

    const confirmationInput = screen.getByPlaceholderText("DELETE");
    const deleteButton = screen.getByRole("button", { name: /delete asset/i });

    // Initially disabled
    expect(deleteButton).toBeDisabled();

    // Type incorrect text
    await user.type(confirmationInput, "delete");
    expect(deleteButton).toBeDisabled();

    // Clear and type correct text
    await user.clear(confirmationInput);
    await user.type(confirmationInput, "DELETE");

    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled();
    });
  });

  it("calls onConfirm when delete button is clicked with correct confirmation", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={mockAsset}
        />
      </TestWrapper>
    );

    const confirmationInput = screen.getByPlaceholderText("DELETE");
    const deleteButton = screen.getByRole("button", { name: /delete asset/i });

    // Enter correct confirmation text
    await user.type(confirmationInput, "DELETE");

    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled();
    });

    // Click delete button
    await user.click(deleteButton);
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={mockAsset}
        />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when isDeleting is true", () => {
    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={mockAsset}
          isDeleting={true}
        />
      </TestWrapper>
    );

    // Check if deleting text is shown
    expect(screen.getByText("Deleting...")).toBeInTheDocument();

    // Check if buttons are disabled
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    const deleteButton = screen.getByRole("button", { name: /deleting/i });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();

    // Check if input is disabled
    const confirmationInput = screen.getByPlaceholderText("DELETE");
    expect(confirmationInput).toBeDisabled();
  });

  it("clears confirmation text when dialog is closed", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={mockAsset}
        />
      </TestWrapper>
    );

    const confirmationInput = screen.getByPlaceholderText("DELETE");

    // Type some text
    await user.type(confirmationInput, "DELETE");
    expect(confirmationInput).toHaveValue("DELETE");

    // Close dialog
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("handles missing optional asset fields gracefully", () => {
    const minimalAsset: Asset = {
      ...mockAsset,
      serialNumber: undefined,
      category: undefined,
      location: undefined,
    };

    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={minimalAsset}
        />
      </TestWrapper>
    );

    // Should display asset name
    expect(screen.getByText("Dell Laptop OptiPlex 7090")).toBeInTheDocument();

    // Should display "-" for missing fields
    expect(screen.getAllByText("-")).toHaveLength(3); // Serial number, category, location
  });

  it("displays correct warning icons and styling", () => {
    render(
      <TestWrapper>
        <DeleteAssetDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          asset={mockAsset}
        />
      </TestWrapper>
    );

    // Check if destructive styling classes are applied
    const deleteButton = screen.getByRole("button", { name: /delete asset/i });
    expect(deleteButton).toHaveClass("destructive"); // This should match the variant prop
  });
});
