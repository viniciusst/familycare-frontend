/**
 * Allergy wire-format types. Mirrors backend's AllergyDto.
 *
 * Backend field naming: "substance" (not "allergen"), matching the
 * domain language used in healthcare records.
 *
 * Severity enum values MUST match backend's Domain/MedicalHistory/Enums.cs:
 * 1=Mild, 2=Moderate, 3=Severe, 4=LifeThreatening
 */

export type AllergySeverity = 1 | 2 | 3 | 4;

export const ALLERGY_SEVERITY_LABELS: Record<AllergySeverity, string> = {
  1: "Mild",
  2: "Moderate",
  3: "Severe",
  4: "Life-threatening",
};

export interface Allergy {
  id: string;
  memberId: string;
  substance: string;
  severity: AllergySeverity;
  reaction: string | null;
  firstObservedAt: string | null; // ISO date (YYYY-MM-DD)
}

/**
 * Allergy enriched with member/family information for display in lists.
 * Built client-side by joining the allergy with its member data.
 */
export interface EnrichedAllergy extends Allergy {
  memberName: string;
  familyId: string;
  familyName: string;
}
