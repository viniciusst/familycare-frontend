import { z } from "zod";

export const registerChronicConditionSchema = z.object({
  name: z
    .string()
    .min(1, "Condition name is required.")
    .max(120, "Condition name must be 120 characters or fewer.")
    .trim(),
  diagnosedAt: z
    .string()
    .min(1, "Diagnosis date is required.")
    .refine((val) => {
      const date = new Date(val);
      return !Number.isNaN(date.getTime()) && date <= new Date();
    }, "Diagnosis date must be a valid past date."),
  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type RegisterChronicConditionInput = z.infer<typeof registerChronicConditionSchema>;

/**
 * Schema for updating a chronic condition's details. Full-replacement
 * semantics: nullable fields cleared when sent as null. The lifecycle
 * (Active/Resolved) is handled separately via the resolve endpoint.
 */
export const updateChronicConditionDetailsSchema = z.object({
  newName: z
    .string()
    .min(1, "Condition name is required.")
    .max(120, "Condition name must be 120 characters or fewer.")
    .trim(),
  newDiagnosedAt: z
    .string()
    .min(1, "Diagnosis date is required.")
    .refine((val) => {
      const date = new Date(val);
      return !Number.isNaN(date.getTime()) && date <= new Date();
    }, "Diagnosis date must be a valid past date."),
  newNotes: z
    .string()
    .max(1000, "Notes must be 1000 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type UpdateChronicConditionDetailsInput = z.infer<
  typeof updateChronicConditionDetailsSchema
>;
