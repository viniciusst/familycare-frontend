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
  // Cross-field rule: backend rejects nextDoseDue before appliedAt.
  // Validate here for nicer UX (error on the offending field).
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
