import {
  assetApiService,
  Asset,
  AssetCreateData,
  AssetUpdateData,
  AssetMovement,
} from "@/services/asset-api";
import { validateApiResponse } from "@/lib/base-api-service";
import {
  useBaseMutation,
  useBaseQuery,
  useBaseList,
  QueryKeys,
} from "@/hooks/base-hooks";
import { QueryOptions } from "@/types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Get paginated assets list
export function useAssets(options?: QueryOptions) {
  return useBaseList(
    QueryKeys.assets.list(options),
    async () => {
      const response = await assetApiService.getAssets(options);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch assets");
      }
      return response;
    },
    options
  );
}

// Get single asset by ID
export function useAsset(id: string) {
  return useBaseQuery(
    QueryKeys.assets.detail(id),
    async () => {
      const response = await assetApiService.getAsset(id);
      return validateApiResponse(response);
    },
    {
      enabled: !!id,
    }
  );
}

// Create new asset mutation with comprehensive error handling
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useBaseMutation<Asset, AssetCreateData>(
    async data => {
      const response = await assetApiService.createAsset(data);
      return validateApiResponse(response);
    },
    {
      onSuccess: asset => {
        toast.success(`Asset "${asset.name}" created successfully`);
        // Invalidate and refetch assets list
        queryClient.invalidateQueries({ queryKey: QueryKeys.assets.all });
        // Update the asset detail cache
        queryClient.setQueryData(QueryKeys.assets.detail(asset.id), asset);
      },
      onError: error => {
        console.error("Error creating asset:", error);
        toast.error(error.message || "Failed to create asset");
      },
    }
  );
}

// Enhanced create asset hook with form validation
export function useCreateAssetWithValidation() {
  const createMutation = useCreateAsset();

  return {
    ...createMutation,
    createAssetAsync: async (data: AssetCreateData) => {
      // Client-side validation before API call
      try {
        return createMutation.mutateAsync(data);
      } catch (error: unknown) {
        if (error && typeof error === "object" && "errors" in error) {
          const validationError = error as {
            errors: Array<{ path: string[]; message: string }>;
          };
          const errorMessage =
            validationError.errors
              ?.map(err => `${err.path.join(".")}: ${err.message}`)
              .join(", ") || "Validation failed";

          throw new Error(errorMessage);
        }

        throw new Error("Validation failed");
      }
    },
  };
}

// Update asset mutation
export function useUpdateAsset() {
  return useBaseMutation<Asset, { id: string; data: AssetUpdateData }>(
    async ({ id, data }) => {
      const response = await assetApiService.updateAsset(id, data);
      return validateApiResponse(response);
    },
    {
      successMessage: "Asset updated successfully!",
      errorMessage: "Failed to update asset. Please try again.",
      invalidateQueries: [
        [...QueryKeys.assets.lists()],
        [...QueryKeys.assets.details()],
      ],
    }
  );
}

// Delete asset mutation
export function useDeleteAsset() {
  return useBaseMutation<void, string>(
    async id => {
      const response = await assetApiService.deleteAsset(id);
      return validateApiResponse(response);
    },
    {
      successMessage: "Asset deleted successfully!",
      errorMessage: "Failed to delete asset. Please try again.",
      invalidateQueries: [[...QueryKeys.assets.lists()]],
    }
  );
}

// Move asset mutation
export function useMoveAsset() {
  return useBaseMutation<
    AssetMovement,
    { id: string; locationId: string; notes?: string }
  >(
    async ({ id, locationId, notes }) => {
      const response = await assetApiService.moveAsset(id, {
        locationId,
        notes,
      });
      return validateApiResponse(response);
    },
    {
      successMessage: "Asset moved successfully!",
      errorMessage: "Failed to move asset. Please try again.",
      invalidateQueries: [
        [...QueryKeys.assets.lists()],
        [...QueryKeys.assets.details()],
      ],
    }
  );
}

// Assign asset mutation
export function useAssignAsset() {
  return useBaseMutation<
    Asset,
    { id: string; assignedTo: string; notes?: string }
  >(
    async ({ id, assignedTo, notes }) => {
      const response = await assetApiService.assignAsset(id, {
        assignedTo,
        notes,
      });
      return validateApiResponse(response);
    },
    {
      successMessage: "Asset assigned successfully!",
      errorMessage: "Failed to assign asset. Please try again.",
      invalidateQueries: [
        [...QueryKeys.assets.lists()],
        [...QueryKeys.assets.details()],
      ],
    }
  );
}

// Unassign asset mutation
export function useUnassignAsset() {
  return useBaseMutation<Asset, { id: string; notes?: string }>(
    async ({ id, notes }) => {
      const response = await assetApiService.unassignAsset(id, notes);
      return validateApiResponse(response);
    },
    {
      successMessage: "Asset unassigned successfully!",
      errorMessage: "Failed to unassign asset. Please try again.",
      invalidateQueries: [
        [...QueryKeys.assets.lists()],
        [...QueryKeys.assets.details()],
      ],
    }
  );
}

// Update asset status mutation
export function useUpdateAssetStatus() {
  return useBaseMutation<Asset, { id: string; status: string; notes?: string }>(
    async ({ id, status, notes }) => {
      const response = await assetApiService.updateAssetStatus(id, {
        status,
        notes,
      });
      return validateApiResponse(response);
    },
    {
      successMessage: "Asset status updated successfully!",
      errorMessage: "Failed to update asset status. Please try again.",
      invalidateQueries: [
        [...QueryKeys.assets.lists()],
        [...QueryKeys.assets.details()],
      ],
    }
  );
}

// Update asset condition mutation
export function useUpdateAssetCondition() {
  return useBaseMutation<
    Asset,
    { id: string; condition: string; notes?: string }
  >(
    async ({ id, condition, notes }) => {
      const response = await assetApiService.updateAssetCondition(id, {
        condition,
        notes,
      });
      return validateApiResponse(response);
    },
    {
      successMessage: "Asset condition updated successfully!",
      errorMessage: "Failed to update asset condition. Please try again.",
      invalidateQueries: [
        [...QueryKeys.assets.lists()],
        [...QueryKeys.assets.details()],
      ],
    }
  );
}

// Get asset categories
export function useAssetCategories() {
  return useBaseQuery(
    QueryKeys.assets.categories(),
    async () => {
      const response = await assetApiService.getAssetCategories();
      return validateApiResponse(response);
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

// Get asset locations
export function useAssetLocations() {
  return useBaseQuery(
    QueryKeys.assets.locations(),
    async () => {
      const response = await assetApiService.getAssetLocations();
      return validateApiResponse(response);
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

// Get asset movements
export function useAssetMovements(id: string) {
  return useBaseQuery(
    [...QueryKeys.assets.detail(id), "movements"],
    async () => {
      const response = await assetApiService.getAssetMovements(id);
      return validateApiResponse(response);
    },
    {
      enabled: !!id,
    }
  );
}

// Get asset work orders
export function useAssetWorkOrders(id: string) {
  return useBaseQuery(
    [...QueryKeys.assets.detail(id), "work-orders"],
    async () => {
      const response = await assetApiService.getAssetWorkOrders(id);
      return validateApiResponse(response);
    },
    {
      enabled: !!id,
    }
  );
}

// Generate asset QR code
export function useGenerateAssetQrCode() {
  return useBaseMutation<{ qrCode: string; qrCodeUrl: string }, string>(
    async id => {
      const response = await assetApiService.generateAssetQrCode(id);
      return validateApiResponse(response);
    },
    {
      successMessage: "QR code generated successfully!",
      errorMessage: "Failed to generate QR code. Please try again.",
    }
  );
}

// Get asset depreciation
export function useAssetDepreciation(id: string) {
  return useBaseQuery(
    [...QueryKeys.assets.detail(id), "depreciation"],
    async () => {
      const response = await assetApiService.getAssetDepreciation(id);
      return validateApiResponse(response);
    },
    {
      enabled: !!id,
    }
  );
}
