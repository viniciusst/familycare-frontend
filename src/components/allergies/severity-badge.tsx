"use client";

import { Badge } from "@/components/ui/badge";
import { ALLERGY_SEVERITY_LABELS, type AllergySeverity } from "@/types/allergies";

interface SeverityBadgeProps {
  severity: AllergySeverity;
}

/**
 * Color-coded badge for allergy severity. Visual gradient communicates
 * the urgency at a glance: green for Mild, escalating to red for
 * Life-threatening.
 */
export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const styles: Record<AllergySeverity, string> = {
    1: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    2: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
    3: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200",
    4: "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  };

  return (
    <Badge variant="outline" className={styles[severity]}>
      {ALLERGY_SEVERITY_LABELS[severity]}
    </Badge>
  );
}
