import { BaseService } from "@/lib/base-service";
import { AssetUser as User } from "@/types";
import { QueryOptions } from "@/types/common";
import { UserCreateData, UserUpdateData, UserFilters } from "@/types/services";

// Re-export types for convenience
export type { User, UserCreateData, UserUpdateData, UserFilters };

// User API service
export class UserApiService extends BaseService {
  private readonly endpoints = {
    users: "/users",
    userDetail: (id: string) => `/users/${id}`,
    userProfile: "/users/profile",
    userAssets: (id: string) => `/users/${id}/assets`,
  } as const;

  constructor() {
    super("/api");
  }

  async getUsers(options?: QueryOptions): Promise<{
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
    const url = this.buildQueryUrl(this.endpoints.users, options);
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

  async getUser(id: string): Promise<User> {
    return this.get<User>(this.endpoints.userDetail(id));
  }

  async createUser(data: UserCreateData): Promise<User> {
    return this.post<User>(this.endpoints.users, data);
  }

  async updateUser(id: string, data: UserUpdateData): Promise<User> {
    return this.put<User>(this.endpoints.userDetail(id), data);
  }

  async deleteUser(id: string): Promise<void> {
    return this.delete<void>(this.endpoints.userDetail(id));
  }

  async getUserProfile(): Promise<User> {
    return this.get<User>(this.endpoints.userProfile);
  }

  async updateUserProfile(data: UserUpdateData): Promise<User> {
    return this.put<User>(this.endpoints.userProfile, data);
  }
}

// Singleton instance
export const userApiService = new UserApiService();
