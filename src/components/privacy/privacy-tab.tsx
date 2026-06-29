"use client";

import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrivacyRulesMatrix } from "./privacy-rules-matrix";
import { usePrivacyRules } from "@/hooks/use-privacy-rules";
import { useMe } from "@/hooks/use-me";
import type { FamilyDetail } from "@/types/api";
import { ensureAllCategories } from "@/types/privacy-rules";

interface PrivacyTabProps {
  family: FamilyDetail;
}

/**
 * Privacy settings tab. Lets the user pick which member's rules to
 * view/edit, then renders the matrix.
 *
 * Permissions:
 * - Owner/Admin can pick any member and edit their rules.
 * - Regular members can only see their own.
 * - Minors can view but not edit (we still let them open the dialog
 *   for transparency, but Save is disabled — handled in the matrix
 *   via the `canEdit` flag).
 */
export function PrivacyTab({ family }: PrivacyTabProps) {
  const { data: me } = useMe();

  // Find the member that represents the current user inside this family.
  const myMember = useMemo(
    () => family.members.find((m) => m.userId === me?.id) ?? null,
    [family.members, me?.id]
  );

  const iAmAdmin = myMember ? myMember.role === 1 || myMember.role === 2 : false;

  // Selectable members depend on permission:
  // - Admins/Owner: every member.
  // - Regular members: only themselves.
  const selectableMembers = useMemo(() => {
    if (iAmAdmin) return family.members;
    return myMember ? [myMember] : [];
  }, [family.members, iAmAdmin, myMember]);

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    () => myMember?.id ?? family.members[0]?.id ?? ""
  );

  const selectedMember = family.members.find((m) => m.id === selectedMemberId);

  // Permission: can the current user edit rules for the selected member?
  // Self always; admins can edit anyone (including minors).
  const canEdit = !!myMember && (selectedMemberId === myMember.id || iAmAdmin);

  const { data: rawRules = [], isLoading, isError } = usePrivacyRules(family.id, selectedMemberId);

  const rules = useMemo(() => ensureAllCategories(rawRules), [rawRules]);

  if (!myMember) {
    return (
      <p className="text-muted-foreground">Could not determine your membership in this family.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-h4">Privacy settings</h2>
        <p className="text-body text-muted-foreground">
          Configure who can see each category of data within this family. Owners always see their
          own data regardless of these settings.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Configuring rules for:</label>
        <Select
          value={selectedMemberId}
          onValueChange={setSelectedMemberId}
          disabled={selectableMembers.length === 1}
        >
          <SelectTrigger className="h-11 w-full sm:w-72">
            <SelectValue placeholder="Select a member" />
          </SelectTrigger>
          <SelectContent>
            {selectableMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.displayName}
                {m.id === myMember.id && (
                  <span className="text-muted-foreground ml-1 text-xs">(you)</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

      {isError && <p className="text-destructive">Could not load privacy rules.</p>}

      {!isLoading && !isError && selectedMember && (
        <PrivacyRulesMatrix
          familyId={family.id}
          memberId={selectedMemberId}
          memberName={selectedMember.displayName}
          rules={rules}
          familyMembers={family.members}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
