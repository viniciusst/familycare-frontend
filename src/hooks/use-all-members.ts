"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useFamilies } from "@/hooks/use-families";
import { clientFetch } from "@/lib/api/client";
import type { FamilyDetail } from "@/types/api";

/**
 * A member entry with enough context to display in selectors:
 * who they are (id + name) and which family they belong to.
 */
export interface MemberOption {
  memberId: string;
  memberName: string;
  familyId: string;
  familyName: string;
}

/**
 * Aggregates all members across all families the user has access to.
 *
 * Used by member selectors (e.g. "Register exam" dialog when invoked from
 * the /exams page header without a pre-selected member). Reuses the
 * familyKey query keys so React Query cache is shared with useFamily().
 */
export function useAllMembers() {
  const { data: families = [] } = useFamilies();

  const familyDetails = useQueries({
    queries: families.map((f) => ({
      queryKey: ["families", f.id],
      queryFn: () => clientFetch<FamilyDetail>(`/api/families/${f.id}`),
    })),
  });

  const members = useMemo(() => {
    const list: MemberOption[] = [];
    familyDetails.forEach((q) => {
      if (q.data) {
        q.data.members.forEach((m) => {
          list.push({
            memberId: m.id,
            memberName: m.displayName,
            familyId: q.data!.id,
            familyName: q.data!.name,
          });
        });
      }
    });
    // Sort by family then by member name for stable display.
    list.sort((a, b) => {
      if (a.familyName !== b.familyName) {
        return a.familyName.localeCompare(b.familyName);
      }
      return a.memberName.localeCompare(b.memberName);
    });
    return list;
  }, [familyDetails]);

  const isLoading = familyDetails.some((q) => q.isLoading);
  const isError = familyDetails.some((q) => q.isError);

  return { members, isLoading, isError };
}
