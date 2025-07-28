/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import AssetList from "../AssetList";
import { Asset } from "@/types/entities";
import enMessages from "@/messages/en.json";

// Mock the API hooks
jest.mock("@/hooks/useAssets", () => ({
  useAssets: jest.fn(),
  useDeleteAsset: jest.fn(),
}));

// Mock toast
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

import { useAssets, useDeleteAsset } from "@/hooks/useAssets";

const mockUseAssets = useAssets as jest.MockedFunction<typeof useAssets>;
const mockUseDeleteAsset = useDeleteAsset as jest.MockedFunction<
  typeof useDeleteAsset
>;

// Mock asset data
const mockAssets: Asset[] = [
  {
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
      companyId: "company-1",
      color: "#3B82F6",
      icon: "monitor",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    location: {
      id: "loc-1",
      name: "Jakarta Office - Floor 3",
      companyId: "company-1",
      address: "Jl. Sudirman No. 123",
      type: "room" as const,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    createdBy: "admin-1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: "asset-2",
    companyId: "company-1",
    assetNumber: "AST-002",
    name: "HP Printer LaserJet Pro",
    description: "Office printer for document printing",
    serialNumber: "HP987654321",
    categoryId: "cat-2",
    locationId: "loc-1",
    purchaseCost: 5000000,
    purchaseDate: "2024-02-01",
    depreciationMethod: "straight_line",
    usefulLifeYears: 7,
    salvageValue: 500000,
    status: "active",
    condition: "good",
    criticality: "medium",
    recyclable: true,
    hazardousMaterials: [],
    softwareLicenses: [],
    tags: ["office", "printer"],
    customFields: {},
    category: {
      id: "cat-2",
      name: "Office Equipment",
      companyId: "company-1",
      color: "#10B981",
      icon: "printer",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    location: {
      id: "loc-1",
      name: "Jakarta Office - Floor 3",
      companyId: "company-1",
      address: "Jl. Sudirman No. 123",
      type: "room" as const,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    createdBy: "admin-1",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-01",
  },
];

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

describe("AssetList Integration", () => {
  const mockOnAddAsset = jest.fn();
  const mockOnEditAsset = jest.fn();
  const mockOnViewAsset = jest.fn();
  const mockDeleteMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
    isIdle: true,
    isError: false,
    isSuccess: false,
    data: undefined,
    error: null,
    variables: undefined,
    status: "idle" as const,
    mutate: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock responses
    mockUseAssets.mockReturnValue({
      data: {
        data: mockAssets,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
      isLoading: false,
    } as ReturnType<typeof useAssets>);

    mockUseDeleteAsset.mockReturnValue(
      mockDeleteMutation as unknown as ReturnType<typeof useDeleteAsset>
    );
  });

  it("renders asset list with data", () => {
    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Check if assets are displayed
    expect(screen.getByText("Dell Laptop OptiPlex 7090")).toBeInTheDocument();
    expect(screen.getByText("HP Printer LaserJet Pro")).toBeInTheDocument();

    // Check if filters are displayed
    expect(screen.getByText("All Status")).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();

    // Check if add button is displayed
    expect(
      screen.getByRole("button", { name: /add new asset/i })
    ).toBeInTheDocument();
  });

  it("opens view dialog when view action is clicked", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Find and click the first asset's action menu
    const actionMenus = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionMenus[0]);

    // Click view option
    const viewButton = screen.getByRole("menuitem", { name: /view/i });
    await user.click(viewButton);

    // Check if view dialog is opened
    await waitFor(() => {
      expect(screen.getByText("Dell Laptop OptiPlex 7090")).toBeInTheDocument();
      expect(screen.getByText("Overview")).toBeInTheDocument(); // Tab in view dialog
    });

    // Check if parent callback is called
    expect(mockOnViewAsset).toHaveBeenCalledWith(mockAssets[0]);
  });

  it("opens delete confirmation dialog when delete action is clicked", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Find and click the first asset's action menu
    const actionMenus = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionMenus[0]);

    // Click delete option
    const deleteButton = screen.getByRole("menuitem", { name: /delete/i });
    await user.click(deleteButton);

    // Check if delete confirmation dialog is opened
    await waitFor(() => {
      expect(screen.getByText("Delete Asset")).toBeInTheDocument();
      expect(
        screen.getByText("This action cannot be undone")
      ).toBeInTheDocument();
    });
  });

  it("performs delete operation when confirmed", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Open delete dialog
    const actionMenus = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionMenus[0]);

    const deleteButton = screen.getByRole("menuitem", { name: /delete/i });
    await user.click(deleteButton);

    // Enter confirmation text
    const confirmationInput = screen.getByPlaceholderText("DELETE");
    await user.type(confirmationInput, "DELETE");

    // Click confirm delete
    const confirmButton = screen.getByRole("button", { name: /delete asset/i });
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    await user.click(confirmButton);

    // Verify delete mutation was called
    expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith("asset-1");
  });

  it("calls onEditAsset when edit action is clicked", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Find and click the first asset's action menu
    const actionMenus = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionMenus[0]);

    // Click edit option
    const editButton = screen.getByRole("menuitem", { name: /edit/i });
    await user.click(editButton);

    // Check if parent callback is called
    expect(mockOnEditAsset).toHaveBeenCalledWith(mockAssets[0]);
  });

  it("calls onAddAsset when add button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Click add button
    const addButton = screen.getByRole("button", { name: /add new asset/i });
    await user.click(addButton);

    // Check if parent callback is called
    expect(mockOnAddAsset).toHaveBeenCalled();
  });

  it("shows loading state when assets are loading", () => {
    mockUseAssets.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useAssets>);

    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Check if loading message is displayed
    expect(screen.getByText("Loading assets...")).toBeInTheDocument();
  });

  it("shows empty state when no assets are found", () => {
    mockUseAssets.mockReturnValue({
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAssets>);

    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Check if empty state is displayed
    expect(screen.getByText("No assets found")).toBeInTheDocument();
    expect(
      screen.getByText("Get started by adding your first asset")
    ).toBeInTheDocument();
  });

  it("updates search term when typing in search input", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Find search input
    const searchInput = screen.getByPlaceholderText("Search assets...");

    // Type in search input
    await user.type(searchInput, "Dell");

    // Verify the input value
    expect(searchInput).toHaveValue("Dell");
  });

  it("shows delete button in loading state during deletion", async () => {
    const user = userEvent.setup();

    // Mock deletion in progress
    const loadingDeleteMutation = {
      mutateAsync: jest.fn(),
      isPending: true,
    };
    mockUseDeleteAsset.mockReturnValue(
      loadingDeleteMutation as unknown as ReturnType<typeof useDeleteAsset>
    );

    render(
      <TestWrapper>
        <AssetList
          onAddAsset={mockOnAddAsset}
          onEditAsset={mockOnEditAsset}
          onViewAsset={mockOnViewAsset}
        />
      </TestWrapper>
    );

    // Open delete dialog
    const actionMenus = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionMenus[0]);

    const deleteButton = screen.getByRole("menuitem", { name: /delete/i });
    await user.click(deleteButton);

    // Check if delete dialog shows loading state
    await waitFor(() => {
      expect(screen.getByText("Deleting...")).toBeInTheDocument();
    });

    // Verify buttons are disabled during loading
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    const confirmButton = screen.getByRole("button", { name: /deleting/i });

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });
});
