"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type {
  CreateFamilyInput,
  RenameFamilyInput,
} from "@/lib/schemas/family";
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
 * Defensive: POST may succeed (family created) but return a payload shape we
 * can't parse, causing a 500 in our proxy. The mutation still treats that as
 * an error, so we add a fallback: if mutate fails BUT the family was actually
 * created, the next list refetch will pick it up. The caller just needs to
 * handle the error gracefully.
 */
export function useCreateFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: CreateFamilyInput,
    ): Promise<FamilySummary | null> => {
      try {
        // Try to parse the response normally.
        const result = await clientFetch<FamilySummary>("/api/families", {
          method: "POST",
          body: input,
        });
        return result;
      } catch (error) {
        // If the proxy returns 500 because it couldn't normalize the response,
        // the family was likely created anyway. Refetch and find it by name.
        await queryClient.invalidateQueries({ queryKey: familiesKey });
        const data = queryClient.getQueryData<{ items: FamilySummary[] }>(
          familiesKey,
        );
        const created = data?.items
          .filter((f) => f.name === input.name)
          // pick the most recently created
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

        if (created) {
          // Family was created despite the error — return it so the UI can navigate.
          return created;
        }

        // Re-throw if we genuinely failed.
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familiesKey });
    },
  });
}

/**
 * Renames a family. Backend uses PATCH /families/{id} with { name: "..." }.
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
 * /families/{id}/members/{mid}/role with { role: 2|3|4|5 }.
 */
export function useChangeMemberRole(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      clientFetch(`/api/families/${familyId}/members/${memberId}/role`, {
        method: "PATCH",
        body: { role },
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
