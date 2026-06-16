import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  role: z.union([
    z.literal(2), // Admin
    z.literal(3), // Adult
    z.literal(4), // Minor
    z.literal(5), // Caregiver
  ]),
  relationship: z.union([
    z.literal(2), // Spouse
    z.literal(3), // Parent
    z.literal(4), // Child
    z.literal(5), // Sibling
    z.literal(6), // Grandparent
    z.literal(7), // Grandchild
    z.literal(8), // Other
    z.literal(9), // Caregiver
  ]),
  expiresInDays: z.number().int().min(1).max(60),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const acceptInvitationSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required.")
    .max(80, "Display name must be 80 characters or fewer.")
    .trim(),
  birthDate: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), "Invalid birth date."),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
