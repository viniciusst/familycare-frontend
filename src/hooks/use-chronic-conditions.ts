"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type { RegisterChronicConditionInput } from "@/lib/schemas/chronic-condition";
import type { ChronicCondition, EnrichedChronicCondition } from "@/types/chronic-conditions";

export const conditionsKey = ["chronic-conditions"] as const;
export const memberConditionsKey = (memberId: string) =>
  ["chronic-conditions", "member", memberId] as const;

export function useAllChronicConditions() {
  return useQuery({
    queryKey: conditionsKey,
    queryFn: () => clientFetch<{ items: EnrichedChronicCondition[] }>("/api/conditions"),
    select: (data) => data.items,
  });
}

export function useMemberChronicConditions(memberId: string, activeOnly?: boolean) {
  const qs = activeOnly !== undefined ? `?activeOnly=${activeOnly}` : "";
  return useQuery({
    queryKey: [...memberConditionsKey(memberId), activeOnly ?? "all"] as const,
    queryFn: () =>
      clientFetch<{ items: ChronicCondition[] }>(`/api/members/${memberId}/conditions${qs}`),
    select: (data) => data.items,
    enabled: !!memberId,
  });
}

export function useRegisterChronicCondition(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterChronicConditionInput) =>
      clientFetch<{ ok: true }>(`/api/members/${memberId}/conditions`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conditionsKey });
      queryClient.invalidateQueries({
        queryKey: memberConditionsKey(memberId),
      });
    },
  });
}

/**
 * Marks a chronic condition as resolved (isActive=false).
 * Backend: POST /chronic-conditions/{id}/resolve (no body).
 */
export function useResolveChronicCondition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conditionId: string) =>
      clientFetch(`/api/conditions/${conditionId}/resolve`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conditionsKey });
    },
  });
}
