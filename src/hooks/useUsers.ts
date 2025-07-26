import {
  userApiService,
  User,
  UserCreateData,
  UserUpdateData,
} from "@/services/user-api";
import { validateApiResponse } from "@/lib/base-api-service";
import {
  useBaseMutation,
  useBaseQuery,
  useBaseList,
  QueryKeys,
} from "@/hooks/base-hooks";
import { QueryOptions, PaginatedResponse } from "@/types";

// Get paginated users list
export function useUsers(options?: QueryOptions) {
  return useBaseList(
    QueryKeys.users.list(options),
    async () => {
      const response = await userApiService.getUsers(options);
      // Return the full response since it should be a PaginatedResponse
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch users");
      }
      return response as PaginatedResponse<User>;
    },
    options
  );
}

// Get single user by ID
export function useUser(id: string) {
  return useBaseQuery(
    QueryKeys.users.detail(id),
    async () => {
      const response = await userApiService.getUser(id);
      return validateApiResponse(response);
    },
    {
      enabled: !!id,
    }
  );
}

// Create new user mutation
export function useCreateUser() {
  return useBaseMutation<User, UserCreateData>(
    async data => {
      const response = await userApiService.createUser(data);
      return validateApiResponse(response);
    },
    {
      successMessage: "User created successfully!",
      errorMessage: "Failed to create user. Please try again.",
      invalidateQueries: [[...QueryKeys.users.lists()]],
    }
  );
}

// Update user mutation
export function useUpdateUser() {
  return useBaseMutation<User, { id: string; data: UserUpdateData }>(
    async ({ id, data }) => {
      const response = await userApiService.updateUser(id, data);
      return validateApiResponse(response);
    },
    {
      successMessage: "User updated successfully!",
      errorMessage: "Failed to update user. Please try again.",
      invalidateQueries: [
        [...QueryKeys.users.lists()],
        [...QueryKeys.users.details()],
      ],
    }
  );
}

// Delete user mutation
export function useDeleteUser() {
  return useBaseMutation<void, string>(
    async id => {
      const response = await userApiService.deleteUser(id);
      return validateApiResponse(response);
    },
    {
      successMessage: "User deleted successfully!",
      errorMessage: "Failed to delete user. Please try again.",
      invalidateQueries: [[...QueryKeys.users.lists()]],
    }
  );
}

// Activate user mutation
export function useActivateUser() {
  return useBaseMutation<User, string>(
    async id => {
      const response = await userApiService.activateUser(id);
      return validateApiResponse(response);
    },
    {
      successMessage: "User activated successfully!",
      errorMessage: "Failed to activate user. Please try again.",
      invalidateQueries: [
        [...QueryKeys.users.lists()],
        [...QueryKeys.users.details()],
      ],
    }
  );
}

// Deactivate user mutation
export function useDeactivateUser() {
  return useBaseMutation<User, string>(
    async id => {
      const response = await userApiService.deactivateUser(id);
      return validateApiResponse(response);
    },
    {
      successMessage: "User deactivated successfully!",
      errorMessage: "Failed to deactivate user. Please try again.",
      invalidateQueries: [
        [...QueryKeys.users.lists()],
        [...QueryKeys.users.details()],
      ],
    }
  );
}

// Reset user password mutation
export function useResetUserPassword() {
  return useBaseMutation<{ temporaryPassword: string }, string>(
    async id => {
      const response = await userApiService.resetUserPassword(id);
      return validateApiResponse(response);
    },
    {
      successMessage:
        "Password reset successfully! Temporary password sent to user.",
      errorMessage: "Failed to reset password. Please try again.",
    }
  );
}
