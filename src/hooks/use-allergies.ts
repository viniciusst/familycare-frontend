"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type {
  ChangeAllergySeverityInput,
  RegisterAllergyInput,
  UpdateAllergyDetailsInput,
} from "@/lib/schemas/allergy";
import type { Allergy, EnrichedAllergy } from "@/types/allergies";

export const allergiesKey = ["allergies"] as const;
export const memberAllergiesKey = (memberId: string) => ["allergies", "member", memberId] as const;

export function useAllAllergies() {
  return useQuery({
    queryKey: allergiesKey,
    queryFn: () => clientFetch<{ items: EnrichedAllergy[] }>("/api/allergies"),
    select: (data) => data.items,
  });
}

export function useMemberAllergies(memberId: string) {
  return useQuery({
    queryKey: memberAllergiesKey(memberId),
    queryFn: () => clientFetch<{ items: Allergy[] }>(`/api/members/${memberId}/allergies`),
    select: (data) => data.items,
    enabled: !!memberId,
  });
}

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

export function useChangeAllergySeverity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ allergyId, input }: { allergyId: string; input: ChangeAllergySeverityInput }) =>
      clientFetch(`/api/allergies/${allergyId}/severity`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allergiesKey });
    },
  });
}

/**
 * Updates an allergy's details (substance, reaction, firstObservedAt).
 * Severity is updated via useChangeAllergySeverity.
 *
 * Backend: PATCH /allergies/{id}/details with the full new state.
 * Nulls clear the field server-side.
 */
export function useUpdateAllergyDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ allergyId, input }: { allergyId: string; input: UpdateAllergyDetailsInput }) =>
      clientFetch(`/api/allergies/${allergyId}/details`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allergiesKey });
    },
  });
}
