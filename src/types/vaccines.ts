/**
 * Vaccine wire-format types. Mirrors backend's VaccineDto.
 *
 * Vaccines are immutable once registered — there's no update endpoint.
 * Doses are tracked by registering a new Vaccine for each dose with
 * the doseNumber field incremented.
 */

export interface Vaccine {
  id: string;
  memberId: string;
  name: string;
  appliedAt: string; // ISO date
  manufacturer: string | null;
  batchNumber: string | null;
  doseNumber: number | null;
  nextDoseDue: string | null;
  notes: string | null;
}

export interface EnrichedVaccine extends Vaccine {
  memberName: string;
  familyId: string;
  familyName: string;
}

/**
 * Computes whether the next dose is overdue based on today's date.
 * Returned as a derived state so the UI can render a discreet warning.
 */
export function isNextDoseOverdue(vaccine: Vaccine): boolean {
  if (!vaccine.nextDoseDue) {
    return false;
  }
  return new Date(vaccine.nextDoseDue) < new Date();
}
