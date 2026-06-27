import { unwrapId } from "./backend";
import type { ChronicCondition } from "@/types/chronic-conditions";

interface RawChronicCondition {
  id: unknown;
  familyMemberId: unknown;
  name: string;
  diagnosedAt: string;
  notes: string | null;
  isActive: boolean;
}

export function normalizeChronicCondition(raw: RawChronicCondition): ChronicCondition {
  return {
    id: unwrapId(raw.id),
    memberId: unwrapId(raw.familyMemberId),
    name: raw.name,
    diagnosedAt: raw.diagnosedAt,
    notes: raw.notes,
    isActive: raw.isActive,
  };
}
