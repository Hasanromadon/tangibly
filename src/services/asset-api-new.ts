import { BaseService } from "@/lib/base-service";
import {
  AssetEntity,
  AssetCategory,
  AssetLocation as Location,
  AssetMovement,
  WorkOrder,
} from "@/types";
import { QueryOptions } from "@/types/common";
import {
  AssetCreateData,
  AssetUpdateData,
  AssetFilters,
} from "@/types/services";

// Additional types for depreciation
interface AssetDepreciation {
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

// Re-export types for convenience
export type {
  AssetEntity as Asset,
  AssetCreateData,
  AssetUpdateData,
  AssetFilters,
};

// Asset API service
export class AssetApiService extends BaseService {
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

  constructor() {
    super("/api");
  }

  async getAssets(options?: QueryOptions): Promise<{
    data: AssetEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const url = this.buildQueryUrl(this.endpoints.assets, options);
    return this.get<{
      data: AssetEntity[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(url);
  }

  async getAsset(id: string): Promise<AssetEntity> {
    return this.get<AssetEntity>(this.endpoints.assetDetail(id));
  }

  async createAsset(data: AssetCreateData): Promise<AssetEntity> {
    return this.post<AssetEntity>(this.endpoints.assets, data);
  }

  async updateAsset(id: string, data: AssetUpdateData): Promise<AssetEntity> {
    return this.put<AssetEntity>(this.endpoints.assetDetail(id), data);
  }

  async deleteAsset(id: string): Promise<void> {
    return this.delete<void>(this.endpoints.assetDetail(id));
  }

  async getAssetCategories(): Promise<AssetCategory[]> {
    return this.get<AssetCategory[]>(this.endpoints.assetCategories);
  }

  async getAssetLocations(): Promise<Location[]> {
    return this.get<Location[]>(this.endpoints.assetLocations);
  }

  async getAssetMovements(id: string): Promise<AssetMovement[]> {
    return this.get<AssetMovement[]>(this.endpoints.assetMovements(id));
  }

  async getAssetWorkOrders(id: string): Promise<WorkOrder[]> {
    return this.get<WorkOrder[]>(this.endpoints.assetWorkOrders(id));
  }

  async generateQrCode(
    id: string,
    size?: number
  ): Promise<{ qrCode: string; qrCodeUrl: string }> {
    const params = size ? `?size=${size}` : "";
    return this.get<{ qrCode: string; qrCodeUrl: string }>(
      `${this.endpoints.assetQrCode(id)}${params}`
    );
  }

  async getAssetDepreciation(
    id: string,
    date?: string
  ): Promise<AssetDepreciation> {
    const params = date ? `?date=${date}` : "";
    return this.get<AssetDepreciation>(
      `${this.endpoints.assetDepreciation(id)}${params}`
    );
  }

  async moveAsset(
    id: string,
    locationId: string,
    notes?: string
  ): Promise<AssetMovement> {
    return this.post<AssetMovement>(this.endpoints.assetMovements(id), {
      locationId,
      notes,
    });
  }

  async assignAsset(
    id: string,
    assignedToId: string,
    notes?: string
  ): Promise<AssetEntity> {
    return this.patch<AssetEntity>(this.endpoints.assetDetail(id), {
      assignedToId,
      notes,
    });
  }

  async unassignAsset(id: string, notes?: string): Promise<AssetEntity> {
    return this.patch<AssetEntity>(this.endpoints.assetDetail(id), {
      assignedToId: null,
      notes,
    });
  }
}

// Singleton instance
export const assetApiService = new AssetApiService();
