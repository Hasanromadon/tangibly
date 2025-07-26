import {
  companyApi,
  type CompanyCreateData,
  type CompanyUpdateData,
} from "@/services/company-api";
import { validateApiResponse } from "@/lib/base-api-service";
import {
  useBaseMutation,
  useBaseQuery,
  useBaseList,
  QueryKeys,
} from "@/hooks/base-hooks";
import type { QueryOptions } from "@/types/common";

// Get paginated companies list
export function useCompanies(options?: QueryOptions) {
  return useBaseList(
    QueryKeys.companies.list(options),
    async () => {
      const response = await companyApi.getCompanies(options);
      validateApiResponse(response);
      return response;
    },
    options
  );
}

// Get company by ID
export function useCompany(id: string) {
  return useBaseQuery(
    QueryKeys.companies.detail(id),
    async () => {
      const response = await companyApi.getCompanyById(id);
      validateApiResponse(response);
      return response.data!;
    },
    { enabled: !!id }
  );
}

// Create new company
export function useCreateCompany() {
  return useBaseMutation(
    async (data: CompanyCreateData) => {
      const response = await companyApi.createCompany(data);
      validateApiResponse(response);
      return response.data!;
    },
    {
      invalidateQueries: [[...QueryKeys.companies.lists()]],
      successMessage: "Company created successfully",
    }
  );
}

// Update company
export function useUpdateCompany() {
  return useBaseMutation(
    async ({ id, data }: { id: string; data: CompanyUpdateData }) => {
      const response = await companyApi.updateCompany(id, data);
      validateApiResponse(response);
      return response.data!;
    },
    {
      invalidateQueries: [[...QueryKeys.companies.lists()]],
      successMessage: "Company updated successfully",
    }
  );
}

// Delete company
export function useDeleteCompany() {
  return useBaseMutation(
    async (id: string) => {
      const response = await companyApi.deleteCompany(id);
      validateApiResponse(response);
      return true;
    },
    {
      invalidateQueries: [[...QueryKeys.companies.lists()]],
      successMessage: "Company deleted successfully",
    }
  );
}
