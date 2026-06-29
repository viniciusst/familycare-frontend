import { unwrapId } from "./backend";
import type { DataCategory, PrivacyRule, VisibilityScope } from "@/types/privacy-rules";

/**
 * Raw shape from backend's PrivacyRuleDto. AllowedMemberIds may serialize
 * either as a plain array of strings or as the strongly-typed { value }
 * shape used elsewhere in the API — unwrapId handles both.
 */
interface RawPrivacyRule {
  category: number;
  scope: number;
  allowedMemberIds: unknown[];
}

export function normalizePrivacyRule(raw: RawPrivacyRule): PrivacyRule {
  return {
    category: raw.category as DataCategory,
    scope: raw.scope as VisibilityScope,
    allowedMemberIds: raw.allowedMemberIds.map(unwrapId),
  };
}
