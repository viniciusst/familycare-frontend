/**
 * Chronic Condition wire-format types. Mirrors backend's ChronicConditionDto.
 *
 * Lifecycle:
 * - Register: condition starts as Active (isActive=true)
 * - Resolve: marks isActive=false (no longer affecting the member)
 *
 * Backend has Reactivate() in domain but no endpoint exposed yet — that's
 * future work if needed.
 */

export interface ChronicCondition {
  id: string;
  memberId: string;
  name: string;
  diagnosedAt: string; // ISO date
  notes: string | null;
  isActive: boolean;
}

export interface EnrichedChronicCondition extends ChronicCondition {
  memberName: string;
  familyId: string;
  familyName: string;
}
