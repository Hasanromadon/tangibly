import { BaseApiService } from "@/lib/base-api-service";
import type {
  Company,
  Asset,
  PaginatedResponse,
  ApiResponse,
} from "@/types/entities";

// Company-specific types
export interface CompanyCreateData {
  name: string;
  code: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  industry?: string;
}

export interface CompanyUpdateData extends Partial<CompanyCreateData> {
  // Additional update-specific fields can be added here
}

export interface CompanyFilters {
  name?: string;
  code?: string;
  industry?: string;
  country?: string;
  isActive?: boolean;
}

export interface CompanySettings {
  timezone: string;
  currency: string;
  locale: string;
  fiscalYearStart: string;
  defaultDepreciationMethod: string;
  auditEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Company API Service
 * Provides standardized axios-based methods for company management
 */
export class CompanyApiService extends BaseApiService {
  private readonly baseUrl = "/api/companies";

  /**
   * Get paginated list of companies
   */
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: CompanyFilters;
  }): Promise<PaginatedResponse<Company>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    // Add filter parameters
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, value.toString());
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}?${searchParams.toString()}`
      : this.baseUrl;

    return this.get<Company[]>(url) as Promise<PaginatedResponse<Company>>;
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id: string): Promise<ApiResponse<Company>> {
    return this.get<Company>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new company
   */
  async createCompany(data: CompanyCreateData): Promise<ApiResponse<Company>> {
    return this.post<Company>(this.baseUrl, data);
  }

  /**
   * Update company
   */
  async updateCompany(
    id: string,
    data: CompanyUpdateData
  ): Promise<ApiResponse<Company>> {
    return this.put<Company>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete company
   */
  async deleteCompany(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(id: string): Promise<
    ApiResponse<{
      totalUsers: number;
      totalAssets: number;
      totalValue: number;
      activeAssets: number;
    }>
  > {
    return this.get<{
      totalUsers: number;
      totalAssets: number;
      totalValue: number;
      activeAssets: number;
    }>(`${this.baseUrl}/${id}/stats`);
  }

  /**
   * Update company settings
   */
  async updateCompanySettings(
    id: string,
    settings: CompanySettings
  ): Promise<ApiResponse<Company>> {
    return this.put<Company>(`${this.baseUrl}/${id}/settings`, { settings });
  }

  /**
   * Get company users
   */
  async getCompanyUsers(
    id: string,
    params?: {
      page?: number;
      limit?: number;
      role?: string;
      isActive?: boolean;
    }
  ): Promise<PaginatedResponse<CompanyUser>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.role) searchParams.set("role", params.role);
    if (params?.isActive !== undefined)
      searchParams.set("isActive", params.isActive.toString());

    const url = searchParams.toString()
      ? `${this.baseUrl}/${id}/users?${searchParams.toString()}`
      : `${this.baseUrl}/${id}/users`;

    return this.get<CompanyUser[]>(url) as Promise<
      PaginatedResponse<CompanyUser>
    >;
  }

  /**
   * Get company assets
   */
  async getCompanyAssets(
    id: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
    }
  ): Promise<PaginatedResponse<Asset>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.category) searchParams.set("category", params.category);

    const url = searchParams.toString()
      ? `${this.baseUrl}/${id}/assets?${searchParams.toString()}`
      : `${this.baseUrl}/${id}/assets`;

    return this.get<Asset[]>(url) as Promise<PaginatedResponse<Asset>>;
  }
}

// Export singleton instance
export const companyApi = new CompanyApiService();
