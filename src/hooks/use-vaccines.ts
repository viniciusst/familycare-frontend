"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type { RegisterVaccineInput, UpdateVaccineDetailsInput } from "@/lib/schemas/vaccine";
import type { EnrichedVaccine, Vaccine } from "@/types/vaccines";

export const vaccinesKey = ["vaccines"] as const;
export const memberVaccinesKey = (memberId: string) => ["vaccines", "member", memberId] as const;

export function useAllVaccines() {
  return useQuery({
    queryKey: vaccinesKey,
    queryFn: () => clientFetch<{ items: EnrichedVaccine[] }>("/api/vaccines"),
    select: (data) => data.items,
  });
}

export function useMemberVaccines(memberId: string) {
  return useQuery({
    queryKey: memberVaccinesKey(memberId),
    queryFn: () => clientFetch<{ items: Vaccine[] }>(`/api/members/${memberId}/vaccines`),
    select: (data) => data.items,
    enabled: !!memberId,
  });
}

export function useRegisterVaccine(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterVaccineInput) =>
      clientFetch<{ ok: true }>(`/api/members/${memberId}/vaccines`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinesKey });
      queryClient.invalidateQueries({ queryKey: memberVaccinesKey(memberId) });
    },
  });
}

/**
 * Updates a vaccine record's details. Use this to fix typos
 * or correct miscategorizations — the fact that the vaccine was
 * administered remains the same.
 *
 * Backend: PATCH /vaccines/{id}/details with full new state.
 */
export function useUpdateVaccineDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vaccineId, input }: { vaccineId: string; input: UpdateVaccineDetailsInput }) =>
      clientFetch(`/api/vaccines/${vaccineId}/details`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinesKey });
    },
  });
}
