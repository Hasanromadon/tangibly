import { BaseApiService } from "@/lib/base-api-service";
import {
  ApiResponse,
  UserInvitation,
  InviteUserData,
  AcceptInvitationData,
  VerifyInvitationResponse,
  AuthResponse,
} from "@/types";

// Re-export types for convenience
export type {
  UserInvitation,
  InviteUserData,
  AcceptInvitationData,
  VerifyInvitationResponse,
};

// Invitation API service
export class InvitationApiService extends BaseApiService {
  private readonly endpoints = {
    invite: "/auth/invite",
    acceptInvitation: "/auth/accept-invitation",
    verifyInvitation: "/auth/verify-invitation",
    invitations: "/auth/invitations",
  } as const;

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

  async getInvitations(): Promise<ApiResponse<UserInvitation[]>> {
    return this.get<UserInvitation[]>(this.endpoints.invitations);
  }

  async cancelInvitation(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoints.invite}/${id}`);
  }

  async resendInvitation(id: string): Promise<ApiResponse<UserInvitation>> {
    return this.post<UserInvitation>(`${this.endpoints.invite}/${id}/resend`);
  }
}

// Singleton instance
export const invitationApiService = new InvitationApiService();
