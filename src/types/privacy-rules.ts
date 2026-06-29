/**
 * Privacy rule types. Mirror backend's PrivacyRuleDto + the
 * DataCategory and VisibilityScope enums from Domain/FamilyManagement.
 *
 * Privacy rules are per (memberId, category). A member can have one
 * rule per category configured; categories without an explicit rule
 * default to Private (only the owner sees their own data).
 */

export type DataCategory = 1 | 2 | 3 | 4 | 5;

export const DATA_CATEGORIES: DataCategory[] = [1, 2, 3, 4, 5];

export const DATA_CATEGORY_LABELS: Record<DataCategory, string> = {
  1: "Medical history",
  2: "Medications",
  3: "Wellbeing",
  4: "Activity",
  5: "Nutrition",
};

export const DATA_CATEGORY_DESCRIPTIONS: Record<DataCategory, string> = {
  1: "Appointments, exams, allergies, vaccines, conditions",
  2: "Prescriptions and ongoing medications",
  3: "Mental health and emotional wellbeing notes",
  4: "Exercise, daily activity, and physical routines",
  5: "Diet, meals, and nutritional tracking",
};

export type VisibilityScope = 1 | 2 | 3 | 4;

export const VISIBILITY_SCOPE_LABELS: Record<VisibilityScope, string> = {
  1: "Private",
  2: "Family admins",
  3: "All family",
  4: "Custom",
};

export const VISIBILITY_SCOPE_DESCRIPTIONS: Record<VisibilityScope, string> = {
  1: "Only the owner can see this data.",
  2: "Owner + Owner/Admin members can see this data.",
  3: "Everyone in the family can see this data.",
  4: "Only members you explicitly select can see this data.",
};

/**
 * A privacy rule for a single category. AllowedMemberIds is only
 * meaningful when scope is Custom (4). For other scopes it should be
 * an empty array.
 */
export interface PrivacyRule {
  category: DataCategory;
  scope: VisibilityScope;
  allowedMemberIds: string[];
}

/**
 * Returns a default Private rule for a category that has not been
 * explicitly configured. Backend creates these on demand; on the
 * frontend we use this for display when the GET response omits a
 * category.
 */
export function defaultPrivacyRule(category: DataCategory): PrivacyRule {
  return {
    category,
    scope: 1, // Private
    allowedMemberIds: [],
  };
}

/**
 * Fills in defaults for categories that aren't in the rules array.
 * Always returns all 5 categories so the UI can render the full matrix.
 */
export function ensureAllCategories(rules: PrivacyRule[]): PrivacyRule[] {
  const byCategory = new Map(rules.map((r) => [r.category, r]));
  return DATA_CATEGORIES.map(
    (category) => byCategory.get(category) ?? defaultPrivacyRule(category)
  );
}
