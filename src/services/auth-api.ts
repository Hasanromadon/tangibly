import { BaseApiClient, ApiResponse } from "@/lib/api-client";

// Authentication data types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  company: {
    name: string;
    npwp: string;
    phone: string;
    email: string;
    address: string;
  };
  user: {
    fullName: string;
    email: string;
    password: string;
  };
}

export interface InviteUserData {
  email: string;
  role: string;
}

export interface AcceptInvitationData {
  token: string;
  password: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  companyId: string;
  employeeId: string | null;
  permissions: string[];
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  npwp: string;
  phone: string;
  email: string;
  address: string;
  subscriptionStatus: string;
  subscriptionPlan: string;
  subscriptionExpiresAt: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  company: Company;
}

export interface InvitationData {
  id: string;
  email: string;
  role: string;
  isAccepted: boolean;
  createdAt: string;
  invitedBy: {
    fullName: string;
  };
}

export interface VerifyInvitationResponse {
  invitation: {
    email: string;
    role: string;
    companyName: string;
    invitedBy: string;
  };
}

// Authentication API service following Single Responsibility Principle
export class AuthApiService extends BaseApiClient {
  private readonly endpoints = {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    invite: "/auth/invite",
    acceptInvitation: "/auth/accept-invitation",
    verifyInvitation: "/auth/verify-invitation",
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

  async inviteUser(data: InviteUserData): Promise<ApiResponse<InvitationData>> {
    return this.post<InvitationData>(this.endpoints.invite, data);
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
}

// Singleton instance
export const authApiService = new AuthApiService();
