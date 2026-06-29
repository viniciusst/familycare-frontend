"use client";

import { Eye, EyeOff, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VISIBILITY_SCOPE_LABELS, type VisibilityScope } from "@/types/privacy-rules";

interface ScopeBadgeProps {
  scope: VisibilityScope;
  customCount?: number;
}

/**
 * Color-coded badge for visibility scope. Visual hierarchy:
 * - Private: muted (most restrictive)
 * - FamilyAdmins: amber (limited access)
 * - AllFamily: green (open within family)
 * - Custom: teal with count (explicit allowlist)
 */
export function ScopeBadge({ scope, customCount }: ScopeBadgeProps) {
  const styles: Record<VisibilityScope, string> = {
    1: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
    2: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
    3: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    4: "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200",
  };

  const Icon = {
    1: EyeOff,
    2: ShieldCheck,
    3: Eye,
    4: Users,
  }[scope];

  return (
    <Badge variant="outline" className={`gap-1.5 ${styles[scope]}`}>
      <Icon className="h-3 w-3" />
      {VISIBILITY_SCOPE_LABELS[scope]}
      {scope === 4 && customCount !== undefined && customCount > 0 && (
        <span className="ml-1 text-xs opacity-80">· {customCount}</span>
      )}
    </Badge>
  );
}
