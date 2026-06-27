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
