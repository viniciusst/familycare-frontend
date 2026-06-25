/**
 * Appointment types — mirror backend DTOs (verified against real responses).
 *
 * Backend keeps the response minimal: only the appointment's own fields.
 * Member / family context (displayName, familyName) is enriched client-side
 * by joining with the families/members data we already have in cache.
 */

export type AppointmentStatus = 1 | 2 | 3;
// 1 = Scheduled, 2 = Completed, 3 = Cancelled

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  1: "Scheduled",
  2: "Completed",
  3: "Cancelled",
};

export const COMMON_SPECIALTIES = [
  "Family medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Gynecology",
  "Neurology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology (ENT)",
  "Psychiatry",
  "Psychology",
  "Urology",
  "Dentistry",
  "Orthodontics",
  "Physiotherapy",
  "Nutrition",
  "Vaccination",
  "Emergency",
  "Other",
];

/**
 * Appointment as returned by the backend (after normalization).
 * The backend field is `familyMemberId` — we normalize to `memberId` on
 * the way in so the rest of the app uses a consistent name.
 */
export interface Appointment {
  id: string;
  memberId: string;
  scheduledAt: string; // ISO datetime UTC
  specialty: string;
  doctorName: string;
  location: string | null;
  notes: string | null;
  status: AppointmentStatus;
}

/**
 * An appointment with client-side enrichment: member display name,
 * family id, and family name attached for display purposes.
 */
export interface EnrichedAppointment extends Appointment {
  memberName: string; // ← padronizado
  familyId: string;
  familyName: string;
}

export function isPastDue(appointment: Appointment): boolean {
  return appointment.status === 1 && new Date(appointment.scheduledAt) < new Date();
}
