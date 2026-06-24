import { unwrapId } from "./backend";
import type { Allergy } from "@/types/allergies";

/**
 * Raw shape from the backend's AllergyDto.
 *
 * Backend uses `familyMemberId`; we normalize to `memberId` for consistency
 * with the rest of the app.
 */
interface RawAllergy {
  id: unknown;
  familyMemberId: unknown;
  substance: string;
  severity: number;
  reaction: string | null;
  firstObservedAt: string | null;
}

export function normalizeAllergy(raw: RawAllergy): Allergy {
  return {
    id: unwrapId(raw.id),
    memberId: unwrapId(raw.familyMemberId),
    substance: raw.substance,
    severity: raw.severity as Allergy["severity"],
    reaction: raw.reaction,
    firstObservedAt: raw.firstObservedAt,
  };
}
