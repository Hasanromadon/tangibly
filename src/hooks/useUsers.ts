import {
  userApiService,
  UserCreateData,
  UserUpdateData,
} from "@/services/user-api";
import {
  useBaseMutation,
  useBaseQuery,
  useBaseList,
  QueryKeys,
} from "@/hooks/base-hooks";
import { QueryOptions, PaginatedResponse } from "@/types/common";
import { AssetUser } from "@/types";
import { toast } from "sonner";

// Get paginated users list
export function useUsers(options?: QueryOptions) {
  return useBaseList(
    QueryKeys.users.list(options),
    async (): Promise<PaginatedResponse<AssetUser>> => {
      const response = await userApiService.getUsers(options);
      // Transform the response to match PaginatedResponse interface
      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
      };
    },
    options
  );
}

// Get single user by ID
export function useUser(id: string) {
  return useBaseQuery(
    QueryKeys.users.detail(id),
    async () => {
      return await userApiService.getUser(id);
    },
    {
      enabled: !!id,
    }
  );
}

// Create new user mutation
export function useCreateUser() {
  return useBaseMutation(
    async (data: UserCreateData) => {
      return await userApiService.createUser(data);
    },
    {
      onSuccess: () => {
        toast.success("User created successfully!");
      },
      onError: () => {
        toast.error("Failed to create user. Please try again.");
      },
      invalidateQueries: [Array.from(QueryKeys.users.lists())],
    }
  );
}

// Update user mutation
export function useUpdateUser() {
  return useBaseMutation(
    async ({ id, data }: { id: string; data: UserUpdateData }) => {
      return await userApiService.updateUser(id, data);
    },
    {
      onSuccess: () => {
        toast.success("User updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update user. Please try again.");
      },
      invalidateQueries: [
        Array.from(QueryKeys.users.lists()),
        Array.from(QueryKeys.users.details()),
      ],
    }
  );
}

// Delete user mutation
export function useDeleteUser() {
  return useBaseMutation(
    async (id: string) => {
      return await userApiService.deleteUser(id);
    },
    {
      onSuccess: () => {
        toast.success("User deleted successfully!");
      },
      onError: () => {
        toast.error("Failed to delete user. Please try again.");
      },
      invalidateQueries: [Array.from(QueryKeys.users.lists())],
    }
  );
}

// Get user profile hook
export function useUserProfile() {
  return useBaseQuery(QueryKeys.users.detail("profile"), async () => {
    return await userApiService.getUserProfile();
  });
}

// Update user profile mutation
export function useUpdateUserProfile() {
  return useBaseMutation(
    async (data: UserUpdateData) => {
      return await userApiService.updateUserProfile(data);
    },
    {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update profile. Please try again.");
      },
      invalidateQueries: [Array.from(QueryKeys.users.detail("profile"))],
    }
  );
}
