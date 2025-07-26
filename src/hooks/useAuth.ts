import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  authApiService,
  LoginCredentials,
  RegisterData,
  InviteUserData,
  AcceptInvitationData,
  AuthResponse,
  InvitationData,
  VerifyInvitationResponse,
} from "@/services/auth-api";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

// Query keys for better cache management
export const authQueryKeys = {
  all: ["auth"] as const,
  verifyInvitation: (token: string) =>
    [...authQueryKeys.all, "verify-invitation", token] as const,
} as const;

// Login mutation hook following Single Responsibility Principle
export function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation<AuthResponse, ApiError, LoginCredentials>({
    mutationFn: async credentials => {
      const response = await authApiService.login(credentials);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Login failed");
      }
      return response.data;
    },
    onSuccess: data => {
      // Store auth data using context
      login(data.token, data.user, data.company);
      toast.success("Login successful! Welcome back.");
      router.push("/asset-management");
    },
    onError: error => {
      toast.error(error.message || "Login failed");
    },
  });
}

// Register mutation hook
export function useRegister() {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation<AuthResponse, ApiError, RegisterData>({
    mutationFn: async data => {
      const response = await authApiService.register(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Registration failed");
      }
      return response.data;
    },
    onSuccess: data => {
      // Store auth data using context
      login(data.token, data.user, data.company);
      toast.success("Account created successfully! Welcome to Tangibly.");
      router.push("/asset-management");
    },
    onError: error => {
      toast.error(error.message || "Registration failed");
    },
  });
}

// Logout mutation hook
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      const response = await authApiService.logout();
      if (!response.success) {
        throw new Error(response.error || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      logout();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    },
    onError: error => {
      // Even if API fails, clear local auth data
      queryClient.clear();
      logout();
      toast.error(
        error.message || "Logout failed, but you have been signed out locally"
      );
      router.push("/auth/login");
    },
  });
}

// Invite user mutation hook
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation<InvitationData, ApiError, InviteUserData>({
    mutationFn: async data => {
      const response = await authApiService.inviteUser(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to send invitation");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      // Invalidate user-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: error => {
      toast.error(error.message || "Failed to send invitation");
    },
  });
}

// Accept invitation mutation hook
export function useAcceptInvitation() {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation<AuthResponse, ApiError, AcceptInvitationData>({
    mutationFn: async data => {
      const response = await authApiService.acceptInvitation(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to accept invitation");
      }
      return response.data;
    },
    onSuccess: data => {
      // Store auth data using context
      login(data.token, data.user, data.company);
      toast.success("Welcome to the team! Your account is now active.");
      router.push("/asset-management");
    },
    onError: error => {
      toast.error(error.message || "Failed to accept invitation");
    },
  });
}

// Verify invitation query hook
export function useVerifyInvitation(token: string) {
  return useQuery<VerifyInvitationResponse, ApiError>({
    queryKey: authQueryKeys.verifyInvitation(token),
    queryFn: async () => {
      const response = await authApiService.verifyInvitation(token);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Invalid invitation token");
      }
      return response.data;
    },
    enabled: !!token,
    retry: false,
    staleTime: 0, // Don't cache invitation verification
  });
}

// Custom hook for handling API errors with form validation
export function useApiErrorHandler() {
  return (
    error: ApiError,
    setError: (field: string, error: { message: string }) => void
  ) => {
    if (error.details && Array.isArray(error.details)) {
      // Handle validation errors
      error.details.forEach(detail => {
        if (detail.path && detail.path.length > 0) {
          const field = detail.path.join(".");
          setError(field, { message: detail.message });
        }
      });
    } else {
      // Handle general errors
      setError("root", { message: error.message });
    }
  };
}
