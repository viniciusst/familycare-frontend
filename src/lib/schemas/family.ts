import { z } from "zod";

/**
 * Schemas for family-related payloads. Mirror backend validation rules.
 */

export const createFamilySchema = z.object({
  name: z
    .string()
    .min(1, "Family name is required.")
    .max(100, "Family name must be 100 characters or fewer.")
    .trim(),
  ownerDisplayName: z
    .string()
    .min(1, "Your display name is required.")
    .max(80, "Display name must be 80 characters or fewer.")
    .trim(),
  ownerBirthDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Date.parse(val)),
      "Invalid birth date.",
    ),
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;

/**
 * Rename uses `newName` to match the backend contract.
 * The form binds to `newName` directly so RHF + the backend speak the same language.
 */
export const renameFamilySchema = z.object({
  newName: z
    .string()
    .min(1, "Family name is required.")
    .max(100, "Family name must be 100 characters or fewer.")
    .trim(),
});

export type RenameFamilyInput = z.infer<typeof renameFamilySchema>;
