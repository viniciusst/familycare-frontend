"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { familyKey } from "@/hooks/use-families";
import { clientFetch } from "@/lib/api/client";
import type { AcceptInvitationInput, InviteMemberInput } from "@/lib/schemas/invitation";
import type { Invitation, InvitationDetails } from "@/types/api";

export const myInvitationsKey = ["invitations", "mine"] as const;
export const familyInvitationsKey = (familyId: string) =>
  ["invitations", "family", familyId] as const;
export const invitationKey = (id: string) => ["invitations", id] as const;

/**
 * Lists invitations addressed to the current authenticated user.
 * Backend filters by the user's email automatically.
 */
export function useMyInvitations(status?: number) {
  const qs = status !== undefined ? `?status=${status}` : "";
  return useQuery({
    queryKey: [...myInvitationsKey, status ?? "all"] as const,
    queryFn: () => clientFetch<{ items: InvitationDetails[] }>(`/api/invitations${qs}`),
    select: (data) => data.items,
  });
}

/**
 * Lists invitations of a given family (admin view).
 * Backend authorization: Owner/Admin only.
 */
export function useFamilyInvitations(familyId: string, status?: number) {
  const qs = status !== undefined ? `?status=${status}` : "";
  return useQuery({
    queryKey: [...familyInvitationsKey(familyId), status ?? "all"] as const,
    queryFn: () =>
      clientFetch<{ items: Invitation[] }>(`/api/families/${familyId}/invitations${qs}`),
    select: (data) => data.items,
    enabled: !!familyId,
  });
}

/**
 * Sends a new invitation. Defensive: don't normalize the POST response —
 * the create succeeded if status is 2xx, the family detail refetch will
 * surface the new pending invitation.
 */
export function useInviteMember(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) =>
      clientFetch<{ ok: true }>(`/api/families/${familyId}/invitations`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKey(familyId) });
      queryClient.invalidateQueries({ queryKey: familyInvitationsKey(familyId) });
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
      queryClient.invalidateQueries({ queryKey: familyInvitationsKey(familyId) });
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
      queryClient.invalidateQueries({ queryKey: myInvitationsKey });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      clientFetch(`/api/invitations/${invitationId}/decline`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myInvitationsKey });
    },
  });
}
