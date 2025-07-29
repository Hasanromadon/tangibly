import {
  assetApiService,
  Asset,
  AssetCreateData,
  AssetUpdateData,
} from "@/services/asset-api";
import { useBaseMutation, useBaseQuery, QueryKeys } from "@/hooks/base-hooks";
import { QueryOptions, ApiError } from "@/types/common";
import { useQueryClient } from "@tanstack/react-query";

// Get paginated assets list
export function useAssets(options?: QueryOptions) {
  return useBaseQuery(
    QueryKeys.assets.list(options),
    async () => {
      return await assetApiService.getAssets(options);
    },
    {
      enabled: true,
    }
  );
}

// Get single asset by ID
export function useAsset(id: string) {
  return useBaseQuery(
    QueryKeys.assets.detail(id),
    async () => {
      return await assetApiService.getAsset(id);
    },
    {
      enabled: !!id,
    }
  );
}

// Create new asset mutation
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    async (data: AssetCreateData) => {
      return await assetApiService.createAsset(data);
    },
    {
      onSuccess: (asset: Asset) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.assets.all] });
        return asset;
      },
      onError: (error: ApiError) => {
        throw new Error(`Failed to create asset: ${error.message}`);
      },
    }
  );
}

// Create asset with validation - alias for form usage
export function useCreateAssetWithValidation() {
  return useCreateAsset();
}

// Update asset mutation
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    async ({ id, data }: { id: string; data: AssetUpdateData }) => {
      return await assetApiService.updateAsset(id, data);
    },
    {
      onSuccess: (asset: Asset) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.assets.all] });
        queryClient.invalidateQueries({
          queryKey: QueryKeys.assets.detail(asset.id),
        });
        return asset;
      },
      onError: (error: ApiError) => {
        throw new Error(`Failed to update asset: ${error.message}`);
      },
    }
  );
}

// Delete asset mutation
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    async (id: string) => {
      await assetApiService.deleteAsset(id);
      return id;
    },
    {
      onSuccess: (deletedId: string) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.assets.all] });
        queryClient.removeQueries({
          queryKey: QueryKeys.assets.detail(deletedId),
        });
        return deletedId;
      },
      onError: (error: ApiError) => {
        throw new Error(`Failed to delete asset: ${error.message}`);
      },
    }
  );
}

// Get asset categories
export function useAssetCategories() {
  return useBaseQuery(QueryKeys.assets.categories(), async () => {
    return await assetApiService.getAssetCategories();
  });
}

// Get asset locations
export function useAssetLocations() {
  return useBaseQuery(QueryKeys.assets.locations(), async () => {
    return await assetApiService.getAssetLocations();
  });
}

// Move asset mutation
export function useMoveAsset() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    async ({
      id,
      locationId,
      notes,
    }: {
      id: string;
      locationId: string;
      notes?: string;
    }) => {
      return await assetApiService.moveAsset(id, locationId, notes);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.assets.all] });
        return "Asset moved successfully";
      },
      onError: (error: ApiError) => {
        throw new Error(`Failed to move asset: ${error.message}`);
      },
    }
  );
}

// Assign asset mutation
export function useAssignAsset() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    async ({
      id,
      assignedToId,
      notes,
    }: {
      id: string;
      assignedToId: string;
      notes?: string;
    }) => {
      return await assetApiService.assignAsset(id, assignedToId, notes);
    },
    {
      onSuccess: (asset: Asset) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.assets.all] });
        queryClient.invalidateQueries({
          queryKey: QueryKeys.assets.detail(asset.id),
        });
        return asset;
      },
      onError: (error: ApiError) => {
        throw new Error(`Failed to assign asset: ${error.message}`);
      },
    }
  );
}

// Unassign asset mutation
export function useUnassignAsset() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    async ({ id, notes }: { id: string; notes?: string }) => {
      return await assetApiService.unassignAsset(id, notes);
    },
    {
      onSuccess: (asset: Asset) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.assets.all] });
        queryClient.invalidateQueries({
          queryKey: QueryKeys.assets.detail(asset.id),
        });
        return "Asset unassigned successfully";
      },
      onError: (error: ApiError) => {
        throw new Error(`Failed to unassign asset: ${error.message}`);
      },
    }
  );
}
