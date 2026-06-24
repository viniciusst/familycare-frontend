import { z } from "zod";

/**
 * Schema for updating editable member details.
 *
 * Implementation note: relationship is validated as a positive integer
 * rather than a strict union of literals. The backend is the source of
 * truth for valid relationship values, and using a more flexible schema
 * here avoids us having to chase enum changes in two places. The Select
 * component constrains the values the user can actually pick.
 */
export const updateMemberDetailsSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required.")
    .max(120, "Display name must be 120 characters or fewer.")
    .trim(),
  birthDate: z
    .string()
    .min(1, "Birth date is required.")
    .refine((val) => {
      const date = new Date(val);
      return !Number.isNaN(date.getTime()) && date <= new Date();
    }, "Birth date must be a valid past date."),
  relationship: z.number().int().positive("Please select a relationship."),
});

export type UpdateMemberDetailsInput = z.infer<typeof updateMemberDetailsSchema>;
