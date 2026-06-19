import { z } from "zod";

/**
 * Schemas for appointment-related payloads.
 *
 * Defaults are NOT in the schema (would mess with Zod 4 + RHF zodResolver
 * typing). Use defaultValues in useForm() instead.
 */

export const scheduleAppointmentSchema = z.object({
  memberId: z.string().min(1, "Member is required."),
  scheduledAt: z
    .string()
    .min(1, "Date and time are required.")
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date/time."),
  specialty: z
    .string()
    .min(1, "Specialty is required.")
    .max(80, "Specialty must be 80 characters or fewer.")
    .trim(),
  doctorName: z
    .string()
    .min(1, "Doctor name is required.")
    .max(120, "Doctor name must be 120 characters or fewer.")
    .trim(),
  location: z
    .string()
    .max(200, "Location must be 200 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type ScheduleAppointmentInput = z.infer<typeof scheduleAppointmentSchema>;

export const cancelAppointmentSchema = z.object({
  reason: z
    .string()
    .max(500, "Reason must be 500 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;

export const rescheduleAppointmentSchema = z.object({
  newScheduledAt: z
    .string()
    .min(1, "Date and time are required.")
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date/time."),
});

export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;

export const updateAppointmentDetailsSchema = z.object({
  doctorName: z
    .string()
    .min(1, "Doctor name is required.")
    .max(120, "Doctor name must be 120 characters or fewer.")
    .trim(),
  specialty: z
    .string()
    .min(1, "Specialty is required.")
    .max(80, "Specialty must be 80 characters or fewer.")
    .trim(),
  location: z
    .string()
    .max(200, "Location must be 200 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type UpdateAppointmentDetailsInput = z.infer<typeof updateAppointmentDetailsSchema>;
