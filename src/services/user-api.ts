import { BaseApiService } from "@/lib/base-api-service";
import {
  ApiResponse,
  PaginatedResponse,
  User,
  UserCreateData,
  UserUpdateData,
  UserFilters,
  QueryOptions,
} from "@/types";

// Re-export types for convenience
export type { User, UserCreateData, UserUpdateData, UserFilters };

// User API service
export class UserApiService extends BaseApiService {
  private readonly endpoints = {
    users: "/users",
    userProfile: (id: string) => `/users/${id}`,
    userActivate: (id: string) => `/users/${id}/activate`,
    userDeactivate: (id: string) => `/users/${id}/deactivate`,
    userResetPassword: (id: string) => `/users/${id}/reset-password`,
  } as const;

  async getUsers(options?: QueryOptions): Promise<PaginatedResponse<User>> {
    const url = this.buildQueryUrl(this.endpoints.users, options);
    return this.get<User[]>(url) as Promise<PaginatedResponse<User>>;
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.get<User>(this.endpoints.userProfile(id));
  }

  async createUser(data: UserCreateData): Promise<ApiResponse<User>> {
    return this.post<User>(this.endpoints.users, data);
  }

  async updateUser(
    id: string,
    data: UserUpdateData
  ): Promise<ApiResponse<User>> {
    return this.put<User>(this.endpoints.userProfile(id), data);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(this.endpoints.userProfile(id));
  }

  async activateUser(id: string): Promise<ApiResponse<User>> {
    return this.patch<User>(this.endpoints.userActivate(id));
  }

  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    return this.patch<User>(this.endpoints.userDeactivate(id));
  }

  async resetUserPassword(
    id: string
  ): Promise<ApiResponse<{ temporaryPassword: string }>> {
    return this.post<{ temporaryPassword: string }>(
      this.endpoints.userResetPassword(id)
    );
  }
}

// Singleton instance
export const userApiService = new UserApiService();
