import {
  invitationApiService,
  UserInvitation,
  InviteUserData,
  AcceptInvitationData,
} from "@/services/invitation-api";
import { validateApiResponse } from "@/lib/base-api-service";
import { useBaseMutation, useBaseQuery, QueryKeys } from "@/hooks/base-hooks";
import { AuthResponse } from "@/types";

// Get all invitations
export function useInvitations() {
  return useBaseQuery(QueryKeys.invitations.lists(), async () => {
    const response = await invitationApiService.getInvitations();
    return validateApiResponse(response);
  });
}

// Invite user mutation
export function useInviteUser() {
  return useBaseMutation<UserInvitation, InviteUserData>(
    async data => {
      const response = await invitationApiService.inviteUser(data);
      return validateApiResponse(response);
    },
    {
      successMessage: "Invitation sent successfully!",
      errorMessage: "Failed to send invitation. Please try again.",
      invalidateQueries: [[...QueryKeys.invitations.lists()]],
    }
  );
}

// Accept invitation mutation
export function useAcceptInvitation() {
  return useBaseMutation<AuthResponse, AcceptInvitationData>(
    async data => {
      const response = await invitationApiService.acceptInvitation(data);
      return validateApiResponse(response);
    },
    {
      successMessage: "Invitation accepted successfully! Welcome to the team.",
      errorMessage: "Failed to accept invitation. Please try again.",
    }
  );
}

// Verify invitation query hook
export function useVerifyInvitation(token: string) {
  return useBaseQuery(
    QueryKeys.invitations.verify(token),
    async () => {
      const response = await invitationApiService.verifyInvitation(token);
      return validateApiResponse(response);
    },
    {
      enabled: !!token,
      retry: false, // Don't retry invalid tokens
    }
  );
}

// Cancel invitation mutation
export function useCancelInvitation() {
  return useBaseMutation<void, string>(
    async id => {
      const response = await invitationApiService.cancelInvitation(id);
      return validateApiResponse(response);
    },
    {
      successMessage: "Invitation cancelled successfully!",
      errorMessage: "Failed to cancel invitation. Please try again.",
      invalidateQueries: [[...QueryKeys.invitations.lists()]],
    }
  );
}

// Resend invitation mutation
export function useResendInvitation() {
  return useBaseMutation<UserInvitation, string>(
    async id => {
      const response = await invitationApiService.resendInvitation(id);
      return validateApiResponse(response);
    },
    {
      successMessage: "Invitation resent successfully!",
      errorMessage: "Failed to resend invitation. Please try again.",
      invalidateQueries: [[...QueryKeys.invitations.lists()]],
    }
  );
}
