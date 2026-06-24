import { z } from "zod";

/**
 * Schema for registering a new allergy. Matches RegisterAllergyRequest on
 * the backend: substance + severity required, others optional.
 */
export const registerAllergySchema = z.object({
  substance: z
    .string()
    .min(1, "Substance is required.")
    .max(120, "Substance must be 120 characters or fewer.")
    .trim(),
  severity: z.union([
    z.literal(1), // Mild
    z.literal(2), // Moderate
    z.literal(3), // Severe
    z.literal(4), // Life-threatening
  ]),
  reaction: z
    .string()
    .max(500, "Reaction must be 500 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
  firstObservedAt: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(new Date(val).getTime()),
      "First observed date must be a valid date."
    ),
});

export type RegisterAllergyInput = z.infer<typeof registerAllergySchema>;

/**
 * Schema for changing an allergy's severity. Backend uses "newSeverity"
 * (matches the new* prefix convention).
 */
export const changeAllergySeveritySchema = z.object({
  newSeverity: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
});

export type ChangeAllergySeverityInput = z.infer<
  typeof changeAllergySeveritySchema
>;
