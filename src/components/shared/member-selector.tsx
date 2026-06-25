"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllMembers, type MemberOption } from "@/hooks/use-all-members";

interface MemberSelectorProps {
  value: string;
  onChange: (memberId: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  /**
   * If set, only members from this family are shown. Useful when the
   * selector is opened from a page already scoped to a family.
   */
  restrictToFamilyId?: string;
}

/**
 * Member selector grouped by family. Designed to be embedded inside
 * dialogs that need the user to pick which family member an action
 * applies to (e.g. "Register exam" when invoked from a global page
 * without a pre-selected member).
 *
 * Shows family names as section headers when multiple families have
 * members; collapses to a flat list when there's only one family.
 */
export function MemberSelector({
  value,
  onChange,
  id,
  placeholder = "Select a member",
  disabled = false,
  restrictToFamilyId,
}: MemberSelectorProps) {
  const { members, isLoading } = useAllMembers();

  const filteredMembers = useMemo(() => {
    if (!restrictToFamilyId) return members;
    return members.filter((m) => m.familyId === restrictToFamilyId);
  }, [members, restrictToFamilyId]);

  // Group by family for sectioned display.
  const grouped = useMemo(() => {
    const map = new Map<string, { familyName: string; entries: MemberOption[] }>();
    for (const m of filteredMembers) {
      const existing = map.get(m.familyId);
      if (existing) {
        existing.entries.push(m);
      } else {
        map.set(m.familyId, { familyName: m.familyName, entries: [m] });
      }
    }
    return Array.from(map.entries());
  }, [filteredMembers]);

  const showFamilyLabels = grouped.length > 1;

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger id={id} className="h-11">
        <SelectValue placeholder={isLoading ? "Loading members…" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {grouped.length === 0 && !isLoading && (
          <div className="text-muted-foreground px-2 py-1.5 text-sm">No members available.</div>
        )}

        {grouped.map(([familyId, { familyName, entries }]) => (
          <SelectGroup key={familyId}>
            {showFamilyLabels && <SelectLabel>{familyName}</SelectLabel>}
            {entries.map((m) => (
              <SelectItem key={m.memberId} value={m.memberId}>
                {m.memberName}
                {!showFamilyLabels && (
                  <span className="text-muted-foreground ml-2 text-xs">· {m.familyName}</span>
                )}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
