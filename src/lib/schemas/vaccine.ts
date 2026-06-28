import { z } from "zod";

export const registerVaccineSchema = z
  .object({
    name: z
      .string()
      .min(1, "Vaccine name is required.")
      .max(120, "Vaccine name must be 120 characters or fewer.")
      .trim(),
    appliedAt: z
      .string()
      .min(1, "Application date is required.")
      .refine(
        (val) => !Number.isNaN(new Date(val).getTime()),
        "Application date must be a valid date."
      ),
    manufacturer: z
      .string()
      .max(120, "Manufacturer must be 120 characters or fewer.")
      .trim()
      .optional()
      .or(z.literal("")),
    batchNumber: z
      .string()
      .max(60, "Batch number must be 60 characters or fewer.")
      .trim()
      .optional()
      .or(z.literal("")),
    doseNumber: z
      .number()
      .int("Dose must be an integer.")
      .min(1, "Dose number must be at least 1.")
      .optional(),
    nextDoseDue: z
      .string()
      .optional()
      .refine(
        (val) => !val || !Number.isNaN(new Date(val).getTime()),
        "Next dose date must be a valid date."
      ),
    notes: z
      .string()
      .max(500, "Notes must be 500 characters or fewer.")
      .trim()
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.nextDoseDue) return true;
      return new Date(data.nextDoseDue) >= new Date(data.appliedAt);
    },
    {
      message: "Next dose cannot be before the application date.",
      path: ["nextDoseDue"],
    }
  );

export type RegisterVaccineInput = z.infer<typeof registerVaccineSchema>;

/**
 * Schema for updating a vaccine record's details. Full-replacement
 * semantics: nullable fields cleared when sent as null. Use this to fix
 * typos or correct miscategorizations; the fact that the vaccine was
 * administered remains.
 */
export const updateVaccineDetailsSchema = z
  .object({
    newName: z
      .string()
      .min(1, "Vaccine name is required.")
      .max(120, "Vaccine name must be 120 characters or fewer.")
      .trim(),
    newAppliedAt: z
      .string()
      .min(1, "Application date is required.")
      .refine(
        (val) => !Number.isNaN(new Date(val).getTime()),
        "Application date must be a valid date."
      ),
    newManufacturer: z
      .string()
      .max(120, "Manufacturer must be 120 characters or fewer.")
      .trim()
      .optional()
      .or(z.literal("")),
    newBatchNumber: z
      .string()
      .max(60, "Batch number must be 60 characters or fewer.")
      .trim()
      .optional()
      .or(z.literal("")),
    newDoseNumber: z
      .number()
      .int("Dose must be an integer.")
      .min(1, "Dose number must be at least 1.")
      .optional(),
    newNextDoseDue: z
      .string()
      .optional()
      .refine(
        (val) => !val || !Number.isNaN(new Date(val).getTime()),
        "Next dose date must be a valid date."
      ),
    newNotes: z
      .string()
      .max(500, "Notes must be 500 characters or fewer.")
      .trim()
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.newNextDoseDue) return true;
      return new Date(data.newNextDoseDue) >= new Date(data.newAppliedAt);
    },
    {
      message: "Next dose cannot be before the application date.",
      path: ["newNextDoseDue"],
    }
  );

export type UpdateVaccineDetailsInput = z.infer<typeof updateVaccineDetailsSchema>;
