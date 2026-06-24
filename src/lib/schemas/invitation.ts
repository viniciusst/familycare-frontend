import { z } from "zod";

/**
 * Field names mirror the backend's InviteMemberCommand:
 * ProposedRole, ProposedRelationship. Keeping naming aligned avoids a
 * translation layer between the form and the API contract.
 *
 * Enum values MUST match Backend Domain/FamilyManagement/Enums.cs:
 * - Role: 1=Owner, 2=Admin, 3=Adult, 4=Minor, 5=Caregiver
 * - RelationshipType: 1=Self, 2=Spouse, 3=Child, 4=Parent, 5=Sibling,
 *   6=Grandparent, 7=Grandchild, 99=Other
 *
 * The relationship range is intentionally discontinuous (jumps to 99 for
 * "Other") to leave room for future values without renumbering.
 */
export const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  proposedRole: z.union([
    z.literal(2), // Admin
    z.literal(3), // Adult
    z.literal(4), // Minor
    z.literal(5), // Caregiver
  ]),
  proposedRelationship: z.union([
    z.literal(2), // Spouse
    z.literal(3), // Child
    z.literal(4), // Parent
    z.literal(5), // Sibling
    z.literal(6), // Grandparent
    z.literal(7), // Grandchild
    z.literal(99), // Other
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
