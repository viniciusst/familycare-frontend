"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type { CreateFamilyInput, RenameFamilyInput } from "@/lib/schemas/family";
import type { UpdateMemberDetailsInput } from "@/lib/schemas/member";
import type { FamilyDetail, FamilySummary, Role } from "@/types/api";

export const familiesKey = ["families"] as const;
export const familyKey = (id: string) => ["families", id] as const;

export function useFamilies() {
  return useQuery({
    queryKey: familiesKey,
    queryFn: () => clientFetch<{ items: FamilySummary[] }>("/api/families"),
    select: (data) => data.items,
  });
}

export function useFamily(id: string) {
  return useQuery({
    queryKey: familyKey(id),
    queryFn: () => clientFetch<FamilyDetail>(`/api/families/${id}`),
    enabled: !!id,
  });
}

/**
 * Creates a new family. Two important details:
 *
 * 1. The POST response is intentionally ignored — we refetch the list and
 *    look up the family by name. Robust against any shape changes.
 * 2. Empty string for ownerBirthDate is stripped before sending. The backend
 *    expects DateOnly | null, not an empty string (which fails JSON binding).
 */
export function useCreateFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateFamilyInput): Promise<FamilySummary> => {
      // Strip empty birthDate — backend DateOnly binding rejects "".
      const payload = {
        ...input,
        ownerBirthDate: input.ownerBirthDate?.trim() || undefined,
      };

      await clientFetch<{ ok: true }>("/api/families", {
        method: "POST",
        body: payload,
      });

      // Refetch and locate the newly created family by name.
      await queryClient.invalidateQueries({ queryKey: familiesKey });
      const data = await queryClient.fetchQuery({
        queryKey: familiesKey,
        queryFn: () => clientFetch<{ items: FamilySummary[] }>("/api/families"),
      });

      const created = data.items
        .filter((f) => f.name === input.name)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

      if (!created) {
        throw new Error("Family was created but could not be loaded.");
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familiesKey });
    },
  });
}

/**
 * Renames a family. Backend uses PATCH /families/{id} with { newName: "..." }.
 */
export function useRenameFamily(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RenameFamilyInput) =>
      clientFetch(`/api/families/${familyId}`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familiesKey });
      queryClient.invalidateQueries({ queryKey: familyKey(familyId) });
    },
  });
}

export function useRemoveMember(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      clientFetch(`/api/families/${familyId}/members/${memberId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKey(familyId) });
      queryClient.invalidateQueries({ queryKey: familiesKey });
    },
  });
}

/**
 * Changes a member's role. Backend uses PATCH on
 * /families/{id}/members/{mid}/role with { newRole: 2|3|4|5 }.
 * Note the "new" prefix — same convention as newName, newScheduledAt, etc.
 */
export function useChangeMemberRole(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      clientFetch(`/api/families/${familyId}/members/${memberId}/role`, {
        method: "PATCH",
        body: { newRole: role },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKey(familyId) });
    },
  });
}

/**
 * Transfers family ownership. Backend uses POST
 * /families/{id}/transfer-ownership with { newOwnerMemberId: "..." }.
 */
export function useTransferOwnership(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerMemberId: string) =>
      clientFetch(`/api/families/${familyId}/transfer-ownership`, {
        method: "POST",
        body: { newOwnerMemberId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKey(familyId) });
      queryClient.invalidateQueries({ queryKey: familiesKey });
    },
  });
}

/**
 * Updates editable member details (displayName, birthDate, relationship).
 * Backend: PATCH /families/{id}/members/{mid}/details
 */
export function useUpdateMemberDetails(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, input }: { memberId: string; input: UpdateMemberDetailsInput }) =>
      clientFetch(`/api/families/${familyId}/members/${memberId}/details`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKey(familyId) });
      queryClient.invalidateQueries({ queryKey: familiesKey });
    },
  });
}
