"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type { ChangePrivacyRuleInput } from "@/lib/schemas/privacy-rule";
import type { DataCategory, PrivacyRule } from "@/types/privacy-rules";

export const privacyRulesKey = (familyId: string, memberId: string) =>
  ["privacy-rules", familyId, memberId] as const;

/**
 * Lists all privacy rules configured for a member in a family.
 *
 * Returns the rules from backend — categories without explicit rules
 * are NOT in the response; callers should use ensureAllCategories()
 * from @/types/privacy-rules to fill defaults.
 */
export function usePrivacyRules(familyId: string, memberId: string) {
  return useQuery({
    queryKey: privacyRulesKey(familyId, memberId),
    queryFn: () =>
      clientFetch<{ items: PrivacyRule[] }>(
        `/api/families/${familyId}/members/${memberId}/privacy-rules`
      ),
    select: (data) => data.items,
    enabled: !!familyId && !!memberId,
  });
}

/**
 * Changes a privacy rule for a (member, category). Sending null/[] for
 * allowedMemberIds when scope != Custom is the documented contract;
 * backend rejects populated allowlists for other scopes.
 */
export function useChangePrivacyRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      familyId,
      memberId,
      category,
      input,
    }: {
      familyId: string;
      memberId: string;
      category: DataCategory;
      input: ChangePrivacyRuleInput;
    }) => {
      // Backend rejects populated allowlists when scope is not Custom.
      const payload = {
        newScope: input.newScope,
        allowedMemberIds: input.newScope === 4 ? (input.allowedMemberIds ?? []) : null,
      };
      return clientFetch(
        `/api/families/${familyId}/members/${memberId}/privacy-rules/${category}`,
        {
          method: "PUT",
          body: payload,
        }
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: privacyRulesKey(variables.familyId, variables.memberId),
      });
    },
  });
}
