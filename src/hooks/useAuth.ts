import { useRouter } from "next/navigation";
import {
  authApiService,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  InviteUserData,
  AcceptInvitationData,
  UserInvitation,
  VerifyInvitationResponse,
} from "@/services/auth-api";
import { validateApiResponse } from "@/lib/base-api-service";
import { useBaseMutation, useBaseQuery, QueryKeys } from "@/hooks/base-hooks";
import { ApiError } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

// Login mutation hook
export function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  return useBaseMutation<AuthResponse, LoginCredentials>(
    async credentials => {
      const response = await authApiService.login(credentials);
      return validateApiResponse(response);
    },
    {
      onSuccess: data => {
        login(data.token, data.user, data.company);
        router.push("/asset-management");
      },
      successMessage: "Login successful! Welcome back.",
      errorMessage: "Login failed. Please check your credentials.",
    }
  );
}

// Register mutation hook
export function useRegister() {
  const router = useRouter();
  const { login } = useAuth();

  return useBaseMutation<AuthResponse, RegisterData>(
    async data => {
      const response = await authApiService.register(data);
      return validateApiResponse(response);
    },
    {
      onSuccess: data => {
        login(data.token, data.user, data.company);
        router.push("/asset-management");
      },
      successMessage: "Registration successful! Welcome to Tangibly.",
      errorMessage: "Registration failed. Please try again.",
    }
  );
}

// Logout mutation hook
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuth();

  return useBaseMutation<void, void>(
    async () => {
      const response = await authApiService.logout();
      return validateApiResponse(response);
    },
    {
      onSuccess: () => {
        logout();
        router.push("/auth/login");
      },
      onError: () => {
        // Force logout even if API call fails
        logout();
        router.push("/auth/login");
      },
      successMessage: "Logged out successfully.",
    }
  );
}

// Get current user query hook
export function useCurrentUser() {
  return useBaseQuery(
    QueryKeys.auth.me(),
    async () => {
      const response = await authApiService.getCurrentUser();
      return validateApiResponse(response);
    },
    {
      enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: ApiError) => {
        // Don't retry on auth errors
        if (error.status === 401 || error.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    }
  );
}

// Invite user mutation hook
export function useInviteUser() {
  return useBaseMutation<UserInvitation, InviteUserData>(
    async data => {
      const response = await authApiService.inviteUser(data);
      return validateApiResponse(response);
    },
    {
      successMessage: "Invitation sent successfully!",
      errorMessage: "Failed to send invitation. Please try again.",
      invalidateQueries: [[...QueryKeys.invitations.lists()]],
    }
  );
}

// Accept invitation mutation hook
export function useAcceptInvitation() {
  const router = useRouter();
  const { login } = useAuth();

  return useBaseMutation<AuthResponse, AcceptInvitationData>(
    async data => {
      const response = await authApiService.acceptInvitation(data);
      return validateApiResponse(response);
    },
    {
      onSuccess: data => {
        login(data.token, data.user, data.company);
        router.push("/asset-management");
      },
      successMessage: "Invitation accepted successfully! Welcome to the team.",
      errorMessage: "Failed to accept invitation. Please try again.",
    }
  );
}

// Verify invitation query hook
export function useVerifyInvitation(token: string) {
  return useBaseQuery<VerifyInvitationResponse>(
    QueryKeys.auth.verify(token),
    async () => {
      const response = await authApiService.verifyInvitation(token);
      return validateApiResponse(response);
    },
    {
      enabled: !!token,
      retry: false, // Don't retry invalid tokens
    }
  );
}

// Refresh token mutation hook
export function useRefreshToken() {
  return useBaseMutation<{ token: string }, void>(
    async () => {
      const response = await authApiService.refreshToken();
      return validateApiResponse(response);
    },
    {
      onSuccess: data => {
        // Update token in localStorage
        localStorage.setItem("token", data.token);
      },
      onError: () => {
        // Force logout on refresh failure
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("company");
        window.location.href = "/auth/login";
      },
    }
  );
}
