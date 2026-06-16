"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { familyKey } from "@/hooks/use-families";
import { clientFetch } from "@/lib/api/client";
import type { AcceptInvitationInput, InviteMemberInput } from "@/lib/schemas/invitation";
import type { Invitation } from "@/types/api";

/**
 * Invitation hooks. NOTE: the backend doesn't expose a "list my invitations"
 * or "list family invitations" endpoint yet, so this module only contains
 * mutation hooks (send, revoke, accept, decline). When those endpoints
 * land we'll add useMyInvitations / useFamilyInvitations / etc.
 */

export function useInviteMember(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) =>
      clientFetch<Invitation>(`/api/families/${familyId}/invitations`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      // No invitation list to invalidate yet — backend doesn't expose one.
      // Once it does, invalidate the list query here.
      queryClient.invalidateQueries({ queryKey: familyKey(familyId) });
    },
  });
}

export function useRevokeInvitation(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      clientFetch(`/api/families/${familyId}/invitations/${invitationId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKey(familyId) });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invitationId, input }: { invitationId: string; input: AcceptInvitationInput }) =>
      clientFetch(`/api/invitations/${invitationId}/accept`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });
}

export function useDeclineInvitation() {
  return useMutation({
    mutationFn: (invitationId: string) =>
      clientFetch(`/api/invitations/${invitationId}/decline`, {
        method: "POST",
      }),
  });
}
