/**
 * Wire-format types that mirror the backend DTOs.
 *
 * The backend serializes IDs as flat strings (e.g. "guid-here") OR
 * as nested { value: "..." } objects in some payloads. The api/normalizers
 * module unwraps either shape to a plain string.
 */

// =============================================================================
// Auth
// =============================================================================

export type SupportedLanguage = 1 | 2 | 3;
// 1 = pt-BR, 2 = en-CA, 3 = fr-CA

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  userId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  preferredLanguage: SupportedLanguage;
  createdAt: string;
}

// =============================================================================
// Families
// =============================================================================

export type Role = 1 | 2 | 3 | 4 | 5;
// 1=Owner, 2=Admin, 3=Adult, 4=Minor, 5=Caregiver

export type RelationshipType =
  | 1 // Self
  | 2 // Spouse
  | 3 // Parent
  | 4 // Child
  | 5 // Sibling
  | 6 // Grandparent
  | 7 // Grandchild
  | 8 // Other
  | 9; // Caregiver

export const ROLE_LABELS: Record<Role, string> = {
  1: "Owner",
  2: "Admin",
  3: "Adult",
  4: "Minor",
  5: "Caregiver",
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  1: "Self",
  2: "Spouse",
  3: "Parent",
  4: "Child",
  5: "Sibling",
  6: "Grandparent",
  7: "Grandchild",
  8: "Other",
  9: "Caregiver",
};

export interface FamilySummary {
  id: string;
  name: string;
  ownerUserId: string;
  memberCount?: number;
  createdAt: string;
}

export interface FamilyDetail {
  id: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
  members: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  userId: string;
  /** Email may not be exposed by the backend in privacy-conscious responses. */
  email?: string;
  displayName: string;
  birthDate: string | null;
  role: Role;
  relationship: RelationshipType;
  joinedAt: string;
}

// =============================================================================
// Invitations
// =============================================================================

export type InvitationStatus = 1 | 2 | 3 | 4;
// 1=Pending, 2=Accepted, 3=Declined, 4=Revoked, expired is a derived state

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  1: "Pending",
  2: "Accepted",
  3: "Declined",
  4: "Revoked",
};

export interface Invitation {
  id: string;
  familyId: string;
  familyName: string;
  email: string;
  role: Role;
  relationship: RelationshipType;
  status: InvitationStatus;
  invitedByUserId: string;
  invitedAt: string;
  expiresAt: string;
}

// =============================================================================
// Problem details (RFC 7807)
// =============================================================================

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  code?: string;
  errors?: Record<string, string[]>;
}
