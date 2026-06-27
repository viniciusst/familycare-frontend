"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type { RegisterVaccineInput } from "@/lib/schemas/vaccine";
import type { EnrichedVaccine, Vaccine } from "@/types/vaccines";

export const vaccinesKey = ["vaccines"] as const;
export const memberVaccinesKey = (memberId: string) => ["vaccines", "member", memberId] as const;

/**
 * Aggregator: list all vaccines across all families/members.
 * The route handler fans out per-member and enriches with member/family
 * context. Per-member 403s (privacy rules) are silently skipped — only
 * family-level failures break the aggregator.
 */
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
