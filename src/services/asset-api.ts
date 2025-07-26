import { BaseApiService } from "@/lib/base-api-service";
import {
  ApiResponse,
  PaginatedResponse,
  Asset,
  AssetCreateData,
  AssetUpdateData,
  AssetFilters,
  QueryOptions,
} from "@/types";

// Re-export types for convenience
export type { Asset, AssetCreateData, AssetUpdateData, AssetFilters };

// Asset API service
export class AssetApiService extends BaseApiService {
  private readonly endpoints = {
    assets: "/assets",
    assetDetail: (id: string) => `/assets/${id}`,
    assetCategories: "/assets/categories",
    assetLocations: "/assets/locations",
    assetMovements: (id: string) => `/assets/${id}/movements`,
    assetWorkOrders: (id: string) => `/assets/${id}/work-orders`,
    assetQrCode: (id: string) => `/assets/${id}/qr-code`,
    assetDepreciation: (id: string) => `/assets/${id}/depreciation`,
  } as const;

  async getAssets(options?: QueryOptions): Promise<PaginatedResponse<Asset>> {
    const url = this.buildQueryUrl(this.endpoints.assets, options);
    return this.get<Asset[]>(url) as Promise<PaginatedResponse<Asset>>;
  }

  async getAsset(id: string): Promise<ApiResponse<Asset>> {
    return this.get<Asset>(this.endpoints.assetDetail(id));
  }

  async createAsset(data: AssetCreateData): Promise<ApiResponse<Asset>> {
    return this.post<Asset>(this.endpoints.assets, data);
  }

  async updateAsset(
    id: string,
    data: AssetUpdateData
  ): Promise<ApiResponse<Asset>> {
    return this.put<Asset>(this.endpoints.assetDetail(id), data);
  }

  async deleteAsset(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(this.endpoints.assetDetail(id));
  }

  async getAssetCategories(): Promise<ApiResponse<AssetCategory[]>> {
    return this.get<AssetCategory[]>(this.endpoints.assetCategories);
  }

  async getAssetLocations(): Promise<ApiResponse<Location[]>> {
    return this.get<Location[]>(this.endpoints.assetLocations);
  }

  async getAssetMovements(id: string): Promise<ApiResponse<AssetMovement[]>> {
    return this.get<AssetMovement[]>(this.endpoints.assetMovements(id));
  }

  async getAssetWorkOrders(id: string): Promise<ApiResponse<WorkOrder[]>> {
    return this.get<WorkOrder[]>(this.endpoints.assetWorkOrders(id));
  }

  async generateAssetQrCode(
    id: string
  ): Promise<ApiResponse<{ qrCode: string; qrCodeUrl: string }>> {
    return this.post<{ qrCode: string; qrCodeUrl: string }>(
      this.endpoints.assetQrCode(id)
    );
  }

  async getAssetDepreciation(
    id: string
  ): Promise<ApiResponse<AssetDepreciation>> {
    return this.get<AssetDepreciation>(this.endpoints.assetDepreciation(id));
  }

  async moveAsset(
    id: string,
    data: { locationId: string; notes?: string }
  ): Promise<ApiResponse<AssetMovement>> {
    return this.post<AssetMovement>(
      `${this.endpoints.assetDetail(id)}/move`,
      data
    );
  }

  async assignAsset(
    id: string,
    data: { assignedTo: string; notes?: string }
  ): Promise<ApiResponse<Asset>> {
    return this.post<Asset>(`${this.endpoints.assetDetail(id)}/assign`, data);
  }

  async unassignAsset(id: string, notes?: string): Promise<ApiResponse<Asset>> {
    return this.post<Asset>(`${this.endpoints.assetDetail(id)}/unassign`, {
      notes,
    });
  }

  async updateAssetStatus(
    id: string,
    data: { status: string; notes?: string }
  ): Promise<ApiResponse<Asset>> {
    return this.patch<Asset>(`${this.endpoints.assetDetail(id)}/status`, data);
  }

  async updateAssetCondition(
    id: string,
    data: { condition: string; notes?: string }
  ): Promise<ApiResponse<Asset>> {
    return this.patch<Asset>(
      `${this.endpoints.assetDetail(id)}/condition`,
      data
    );
  }
}

// Types for related entities
export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  companyId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AssetMovement {
  id: string;
  assetId: string;
  fromLocationId?: string;
  toLocationId: string;
  movedBy: string;
  notes?: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  assetId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AssetDepreciation {
  id: string;
  assetId: string;
  method: string;
  usefulLifeYears: number;
  salvageValue: number;
  currentValue: number;
  accumulatedDepreciation: number;
  monthlyDepreciation: number;
  createdAt: string;
  updatedAt?: string;
}

// Singleton instance
export const assetApiService = new AssetApiService();
