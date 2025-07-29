import { BaseService } from "@/lib/base-service";
import {
  UserInvitation,
  InviteUserData,
  AcceptInvitationData,
  VerifyInvitationResponse,
  AuthResponse,
} from "@/types/services";

// Re-export types for convenience
export type {
  UserInvitation,
  InviteUserData,
  AcceptInvitationData,
  VerifyInvitationResponse,
  AuthResponse,
};

// Invitation API service
export class InvitationApiService extends BaseService {
  private readonly endpoints = {
    invite: "/auth/invite",
    acceptInvitation: "/auth/accept-invitation",
    verifyInvitation: "/auth/verify-invitation",
    resendInvitation: (id: string) => `/auth/invitations/${id}/resend`,
    revokeInvitation: (id: string) => `/auth/invitations/${id}/revoke`,
  } as const;

  constructor() {
    super("/api");
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

  async resendInvitation(id: string): Promise<UserInvitation> {
    return this.post<UserInvitation>(this.endpoints.resendInvitation(id));
  }

  async revokeInvitation(id: string): Promise<void> {
    return this.delete<void>(this.endpoints.revokeInvitation(id));
  }
}

// Singleton instance
export const invitationApiService = new InvitationApiService();
