import { z } from "zod";

/**
 * Zod schemas for authentication payloads. They are imported by both:
 *   - client-side forms (react-hook-form + zodResolver)
 *   - server-side route handlers (to validate incoming JSON)
 *
 * Defining them once keeps the contract consistent across both sides.
 */

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be 128 characters or fewer."),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Backend password policy:
 *   - min 8 chars
 *   - at least one uppercase letter
 *   - at least one digit
 *   - at least one special character
 *
 * We mirror it client-side so users get instant feedback.
 */
export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Password must contain at least one digit.")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character."
      ),
    confirmPassword: z.string(),
    preferredLanguage: z
      .union([z.literal(1), z.literal(2), z.literal(3)])
      .default(2),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
