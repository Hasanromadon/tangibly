import { BaseService } from "@/lib/base-service";
import { User, Company } from "@/types";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  InviteUserData,
  AcceptInvitationData,
  UserInvitation,
  VerifyInvitationResponse,
} from "@/types/services";

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
export class AuthApiService extends BaseService {
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

  constructor() {
    super("/api");
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>(this.endpoints.login, credentials);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>(this.endpoints.register, data);
  }

  async logout(): Promise<void> {
    return this.post<void>(this.endpoints.logout);
  }

  async getCurrentUser(): Promise<{ user: User; company: Company }> {
    return this.get<{ user: User; company: Company }>(this.endpoints.me);
  }

  async inviteUser(data: InviteUserData): Promise<UserInvitation> {
    return this.post<UserInvitation>(this.endpoints.invite, data);
  }

  async acceptInvitation(data: AcceptInvitationData): Promise<AuthResponse> {
    return this.post<AuthResponse>(this.endpoints.acceptInvitation, data);
  }

  async verifyInvitation(token: string): Promise<VerifyInvitationResponse> {
    return this.get<VerifyInvitationResponse>(
      `${this.endpoints.verifyInvitation}?token=${token}`
    );
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.post<{ token: string }>(this.endpoints.refreshToken);
  }
}

// Singleton instance
export const authApiService = new AuthApiService();
