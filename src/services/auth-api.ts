import { BaseApiService } from "@/lib/base-api-service";
import {
  ApiResponse,
  User,
  Company,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  InviteUserData,
  AcceptInvitationData,
  UserInvitation,
  VerifyInvitationResponse,
} from "@/types";

// Re-export types for convenience
export type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  InviteUserData,
  AcceptInvitationData,
  UserInvitation,
  VerifyInvitationResponse,
  User,
  Company,
};

// Authentication API service
export class AuthApiService extends BaseApiService {
  private readonly endpoints = {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    me: "/auth/me",
    invite: "/auth/invite",
    acceptInvitation: "/auth/accept-invitation",
    verifyInvitation: "/auth/verify-invitation",
    refreshToken: "/auth/refresh",
  } as const;

  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>(this.endpoints.login, credentials);
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>(this.endpoints.register, data);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.post<void>(this.endpoints.logout);
  }

  async getCurrentUser(): Promise<
    ApiResponse<{ user: User; company: Company }>
  > {
    return this.get<{ user: User; company: Company }>(this.endpoints.me);
  }

  async inviteUser(data: InviteUserData): Promise<ApiResponse<UserInvitation>> {
    return this.post<UserInvitation>(this.endpoints.invite, data);
  }

  async acceptInvitation(
    data: AcceptInvitationData
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>(this.endpoints.acceptInvitation, data);
  }

  async verifyInvitation(
    token: string
  ): Promise<ApiResponse<VerifyInvitationResponse>> {
    return this.get<VerifyInvitationResponse>(
      `${this.endpoints.verifyInvitation}?token=${token}`
    );
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.post<{ token: string }>(this.endpoints.refreshToken);
  }
}

// Singleton instance
export const authApiService = new AuthApiService();
