import { unwrapId } from "./backend";
import type { Vaccine } from "@/types/vaccines";

interface RawVaccine {
  id: unknown;
  familyMemberId: unknown;
  name: string;
  appliedAt: string;
  manufacturer: string | null;
  batchNumber: string | null;
  doseNumber: number | null;
  nextDoseDue: string | null;
  notes: string | null;
}

export function normalizeVaccine(raw: RawVaccine): Vaccine {
  return {
    id: unwrapId(raw.id),
    memberId: unwrapId(raw.familyMemberId),
    name: raw.name,
    appliedAt: raw.appliedAt,
    manufacturer: raw.manufacturer,
    batchNumber: raw.batchNumber,
    doseNumber: raw.doseNumber,
    nextDoseDue: raw.nextDoseDue,
    notes: raw.notes,
  };
}
