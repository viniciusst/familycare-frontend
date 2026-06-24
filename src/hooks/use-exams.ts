"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type { RegisterExamInput, UpdateExamResultsInput } from "@/lib/schemas/exam";
import type { EnrichedExam, Exam } from "@/types/exams";

export const examsKey = ["exams"] as const;
export const memberExamsKey = (memberId: string) => ["exams", "member", memberId] as const;

/**
 * Lists all exams across all families/members the user has access to.
 * The route handler fans out per-member calls and enriches with family/member
 * context client-side.
 */
export function useAllExams() {
  return useQuery({
    queryKey: examsKey,
    queryFn: () => clientFetch<{ items: EnrichedExam[] }>("/api/exams"),
    select: (data) => data.items,
  });
}

/**
 * Lists exams for a specific family member.
 */
export function useMemberExams(memberId: string) {
  return useQuery({
    queryKey: memberExamsKey(memberId),
    queryFn: () => clientFetch<{ items: Exam[] }>(`/api/members/${memberId}/exams`),
    select: (data) => data.items,
    enabled: !!memberId,
  });
}

/**
 * Registers a new exam for a member. Defensive: don't trust POST response —
 * refetch list to get canonical state.
 */
export function useRegisterExam(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterExamInput) =>
      clientFetch<{ ok: true }>(`/api/members/${memberId}/exams`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examsKey });
      queryClient.invalidateQueries({ queryKey: memberExamsKey(memberId) });
    },
  });
}

/**
 * Updates an exam's results. Backend uses PATCH /exams/{id}/results
 * with { newResults }.
 */
export function useUpdateExamResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, input }: { examId: string; input: UpdateExamResultsInput }) =>
      clientFetch(`/api/exams/${examId}/results`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examsKey });
    },
  });
}
