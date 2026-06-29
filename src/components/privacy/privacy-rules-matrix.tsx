"use client";

import { Activity, Apple, HeartPulse, Pencil, Pill, Smile } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditPrivacyRuleDialog } from "./edit-privacy-rule-dialog";
import { ScopeBadge } from "./scope-badge";
import type { FamilyMember } from "@/types/api";
import {
  DATA_CATEGORY_DESCRIPTIONS,
  DATA_CATEGORY_LABELS,
  type DataCategory,
  type PrivacyRule,
} from "@/types/privacy-rules";

interface PrivacyRulesMatrixProps {
  familyId: string;
  memberId: string;
  memberName: string;
  rules: PrivacyRule[];
  /** All members in the family — used to render allowlist names. */
  familyMembers: FamilyMember[];
  /** Whether the current user can edit these rules. */
  canEdit: boolean;
}

/**
 * Category icons keep the matrix readable at a glance. Each row also
 * shows a short description so the user understands what each
 * category covers.
 */
const CATEGORY_ICONS: Record<DataCategory, React.ComponentType<{ className?: string }>> = {
  1: HeartPulse,
  2: Pill,
  3: Smile,
  4: Activity,
  5: Apple,
};

export function PrivacyRulesMatrix({
  familyId,
  memberId,
  memberName,
  rules,
  familyMembers,
  canEdit,
}: PrivacyRulesMatrixProps) {
  const [editingRule, setEditingRule] = useState<PrivacyRule | null>(null);

  return (
    <>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Category</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => {
              const Icon = CATEGORY_ICONS[rule.category];
              const allowedNames = rule.allowedMemberIds
                .map((id) => familyMembers.find((m) => m.id === id)?.displayName ?? "Unknown")
                .join(", ");

              return (
                <TableRow key={rule.category}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="bg-muted text-muted-foreground rounded-md p-1.5">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{DATA_CATEGORY_LABELS[rule.category]}</div>
                        <div className="text-muted-foreground line-clamp-1 text-xs">
                          {DATA_CATEGORY_DESCRIPTIONS[rule.category]}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <ScopeBadge
                        scope={rule.scope}
                        customCount={rule.scope === 4 ? rule.allowedMemberIds.length : undefined}
                      />
                      {rule.scope === 4 && allowedNames && (
                        <div className="text-muted-foreground line-clamp-1 text-xs">
                          {allowedNames}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-12">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingRule(rule)}
                        aria-label={`Edit ${DATA_CATEGORY_LABELS[rule.category]} visibility`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editingRule && (
        <EditPrivacyRuleDialog
          open={!!editingRule}
          onOpenChange={(open) => !open && setEditingRule(null)}
          familyId={familyId}
          memberId={memberId}
          memberName={memberName}
          rule={editingRule}
          familyMembers={familyMembers}
        />
      )}
    </>
  );
}
