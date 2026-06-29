import { z } from "zod";

/**
 * Schema for changing a privacy rule. Matches the backend's
 * ChangePrivacyRuleRequest:
 *   { newScope: VisibilityScope, allowedMemberIds?: Guid[] }
 *
 * The backend rejects populated allowlists when scope != Custom, so we
 * also normalize that at the API client layer (send null/[] when scope
 * is not Custom).
 */
export const changePrivacyRuleSchema = z
  .object({
    newScope: z.union([
      z.literal(1), // Private
      z.literal(2), // FamilyAdmins
      z.literal(3), // AllFamily
      z.literal(4), // Custom
    ]),
    allowedMemberIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => {
      // Custom scope requires at least one member.
      if (data.newScope === 4) {
        return data.allowedMemberIds && data.allowedMemberIds.length > 0;
      }
      return true;
    },
    {
      message: "Custom scope requires at least one member to be selected.",
      path: ["allowedMemberIds"],
    }
  );

export type ChangePrivacyRuleInput = z.infer<typeof changePrivacyRuleSchema>;
