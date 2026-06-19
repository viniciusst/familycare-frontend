import { unwrapId } from "./backend";
import type { Appointment } from "@/types/appointments";

/**
 * Raw shape from the backend (verified via Scalar response).
 *
 * Key thing: backend uses `familyMemberId`, we normalize to `memberId`
 * for consistency with the rest of the app (the frontend mostly says
 * "member" not "family member"). Same data, friendlier name.
 */
interface RawAppointment {
  id: unknown;
  familyMemberId: unknown;
  scheduledAt: string;
  specialty: string;
  doctorName: string;
  location: string | null;
  notes: string | null;
  status: number;
}

export function normalizeAppointment(raw: RawAppointment): Appointment {
  return {
    id: unwrapId(raw.id),
    memberId: unwrapId(raw.familyMemberId),
    scheduledAt: raw.scheduledAt,
    specialty: raw.specialty,
    doctorName: raw.doctorName,
    location: raw.location,
    notes: raw.notes,
    status: raw.status as Appointment["status"],
  };
}
