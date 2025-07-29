import { useRouter } from "next/navigation";
import {
  authApiService,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  InviteUserData,
  AcceptInvitationData,
  UserInvitation,
} from "@/services/auth-api";
import { useBaseMutation, useBaseQuery, QueryKeys } from "@/hooks/base-hooks";
import { ApiError } from "@/types/common";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Login mutation hook
export function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  return useBaseMutation(
    async (credentials: LoginCredentials) => {
      return await authApiService.login(credentials);
    },
    {
      onSuccess: async (data: AuthResponse) => {
        // Get full user and company data after login
        try {
          const { user, company } = await authApiService.getCurrentUser();
          login(data.token, user, company);
          toast.success("Login successful");
          router.push("/asset-management");
        } catch {
          toast.error("Failed to get user data after login");
        }
      },
      onError: (error: ApiError) => {
        toast.error(`Login failed: ${error.message}`);
      },
    }
  );
}

// Register mutation hook
export function useRegister() {
  const router = useRouter();

  return useBaseMutation(
    async (data: RegisterData) => {
      return await authApiService.register(data);
    },
    {
      onSuccess: () => {
        toast.success("Registration successful");
        router.push("/auth/login");
      },
      onError: (error: ApiError) => {
        toast.error(`Registration failed: ${error.message}`);
      },
    }
  );
}

// Logout mutation hook
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuth();

  return useBaseMutation(
    async () => {
      await authApiService.logout();
    },
    {
      onSuccess: () => {
        logout();
        toast.success("Logged out successfully");
        router.push("/auth/login");
      },
      onError: (error: ApiError) => {
        // Even if logout API fails, clear local state
        logout();
        router.push("/auth/login");
        toast.error(`Logout error: ${error.message}`);
      },
    }
  );
}

// Get current user hook
export function useCurrentUser() {
  return useBaseQuery(
    QueryKeys.auth.me(),
    async () => {
      return await authApiService.getCurrentUser();
    },
    {
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Invite user mutation hook
export function useInviteUser() {
  return useBaseMutation(
    async (data: InviteUserData) => {
      return await authApiService.inviteUser(data);
    },
    {
      onSuccess: (invitation: UserInvitation) => {
        toast.success(`Invitation sent to ${invitation.email}`);
      },
      onError: (error: ApiError) => {
        toast.error(`Failed to send invitation: ${error.message}`);
      },
    }
  );
}

// Accept invitation mutation hook
export function useAcceptInvitation() {
  const router = useRouter();
  const { login } = useAuth();

  return useBaseMutation(
    async (data: AcceptInvitationData) => {
      return await authApiService.acceptInvitation(data);
    },
    {
      onSuccess: async (data: AuthResponse) => {
        // Get full user and company data after accepting invitation
        try {
          const { user, company } = await authApiService.getCurrentUser();
          login(data.token, user, company);
          toast.success("Invitation accepted successfully");
          router.push("/asset-management");
        } catch {
          toast.error("Failed to get user data after accepting invitation");
        }
      },
      onError: (error: ApiError) => {
        toast.error(`Failed to accept invitation: ${error.message}`);
      },
    }
  );
}

// Verify invitation hook
export function useVerifyInvitation(token: string) {
  return useBaseQuery(
    QueryKeys.auth.verify(token),
    async () => {
      return await authApiService.verifyInvitation(token);
    },
    {
      enabled: !!token,
      retry: false,
    }
  );
}

// Refresh token mutation hook
export function useRefreshToken() {
  return useBaseMutation(
    async () => {
      return await authApiService.refreshToken();
    },
    {
      onError: (error: ApiError) => {
        console.error("Token refresh failed:", error.message);
      },
    }
  );
}
