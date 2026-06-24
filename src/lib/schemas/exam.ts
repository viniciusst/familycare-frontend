import { z } from "zod";

/**
 * Schema for registering a new exam. Matches RegisterExamRequest on
 * the backend: examDate + examType required, others optional.
 */
export const registerExamSchema = z.object({
  examDate: z
    .string()
    .min(1, "Exam date is required.")
    .refine((val) => {
      const date = new Date(val);
      return !Number.isNaN(date.getTime());
    }, "Exam date must be a valid date."),
  examType: z
    .string()
    .min(1, "Exam type is required.")
    .max(120, "Exam type must be 120 characters or fewer.")
    .trim(),
  laboratory: z
    .string()
    .max(120, "Laboratory must be 120 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
  results: z
    .string()
    .max(4000, "Results must be 4000 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
  requestedBy: z
    .string()
    .max(120, "Requested by must be 120 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type RegisterExamInput = z.infer<typeof registerExamSchema>;

/**
 * Schema for updating an exam's results. Backend uses "newResults"
 * (matches the new* prefix pattern used across update payloads).
 */
export const updateExamResultsSchema = z.object({
  newResults: z
    .string()
    .min(1, "Results are required.")
    .max(4000, "Results must be 4000 characters or fewer.")
    .trim(),
});

export type UpdateExamResultsInput = z.infer<typeof updateExamResultsSchema>;
