"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type {
  ChangeAllergySeverityInput,
  RegisterAllergyInput,
} from "@/lib/schemas/allergy";
import type { Allergy, EnrichedAllergy } from "@/types/allergies";

export const allergiesKey = ["allergies"] as const;
export const memberAllergiesKey = (memberId: string) =>
  ["allergies", "member", memberId] as const;

/**
 * Lists all allergies across all families/members the user has access to.
 * The route handler fans out per-member calls and enriches with family/member
 * context client-side.
 */
export function useAllAllergies() {
  return useQuery({
    queryKey: allergiesKey,
    queryFn: () =>
      clientFetch<{ items: EnrichedAllergy[] }>("/api/allergies"),
    select: (data) => data.items,
  });
}

/**
 * Lists allergies for a specific family member.
 */
export function useMemberAllergies(memberId: string) {
  return useQuery({
    queryKey: memberAllergiesKey(memberId),
    queryFn: () =>
      clientFetch<{ items: Allergy[] }>(`/api/members/${memberId}/allergies`),
    select: (data) => data.items,
    enabled: !!memberId,
  });
}

/**
 * Registers a new allergy for a member. Defensive: don't trust POST
 * response — refetch list to get canonical state.
 */
export function useRegisterAllergy(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterAllergyInput) =>
      clientFetch<{ ok: true }>(`/api/members/${memberId}/allergies`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allergiesKey });
      queryClient.invalidateQueries({
        queryKey: memberAllergiesKey(memberId),
      });
    },
  });
}

/**
 * Changes an allergy's severity. Backend uses PATCH /allergies/{id}/severity
 * with { newSeverity }.
 */
export function useChangeAllergySeverity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      allergyId,
      input,
    }: {
      allergyId: string;
      input: ChangeAllergySeverityInput;
    }) =>
      clientFetch(`/api/allergies/${allergyId}/severity`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allergiesKey });
    },
  });
}
