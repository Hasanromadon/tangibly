import { BaseService } from "@/lib/base-service";
import {
  AssetCompany as Company,
  AssetEntity,
  AssetUser as User,
} from "@/types";
import { QueryOptions } from "@/types/common";
import { CompanyCreateData, CompanyUpdateData } from "@/types/services";

// Re-export types for convenience
export type { Company, CompanyCreateData, CompanyUpdateData };

// Company API service
export class CompanyApiService extends BaseService {
  private readonly endpoints = {
    companies: "/companies",
    companyDetail: (id: string) => `/companies/${id}`,
    companyAssets: (id: string) => `/companies/${id}/assets`,
    companyUsers: (id: string) => `/companies/${id}/users`,
    companySettings: (id: string) => `/companies/${id}/settings`,
    companySubscription: (id: string) => `/companies/${id}/subscription`,
  } as const;

  constructor() {
    super("/api");
  }

  async getCompanies(options?: QueryOptions): Promise<{
    data: Company[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const url = this.buildQueryUrl(this.endpoints.companies, options);
    return this.get<{
      data: Company[];
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

  async getCompany(id: string): Promise<Company> {
    return this.get<Company>(this.endpoints.companyDetail(id));
  }

  async createCompany(data: CompanyCreateData): Promise<Company> {
    return this.post<Company>(this.endpoints.companies, data);
  }

  async updateCompany(id: string, data: CompanyUpdateData): Promise<Company> {
    return this.put<Company>(this.endpoints.companyDetail(id), data);
  }

  async deleteCompany(id: string): Promise<void> {
    return this.delete<void>(this.endpoints.companyDetail(id));
  }

  async getCompanyAssets(
    id: string,
    options?: QueryOptions
  ): Promise<{
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
    const url = this.buildQueryUrl(this.endpoints.companyAssets(id), options);
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

  async getCompanyUsers(
    id: string,
    options?: QueryOptions
  ): Promise<{
    data: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const url = this.buildQueryUrl(this.endpoints.companyUsers(id), options);
    return this.get<{
      data: User[];
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

  async updateCompanySettings(
    id: string,
    settings: Record<string, unknown>
  ): Promise<Company> {
    return this.patch<Company>(this.endpoints.companySettings(id), {
      settings,
    });
  }

  async updateCompanySubscription(
    id: string,
    subscriptionData: {
      plan: "starter" | "professional" | "enterprise";
      expiresAt?: Date;
    }
  ): Promise<Company> {
    return this.patch<Company>(
      this.endpoints.companySubscription(id),
      subscriptionData
    );
  }
}

// Singleton instance
export const companyApiService = new CompanyApiService();
