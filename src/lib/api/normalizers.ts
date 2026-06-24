import { unwrapId } from "./backend";
import type {
  FamilyDetail,
  FamilyMember,
  FamilySummary,
  Invitation,
  InvitationDetails,
} from "@/types/api";

/**
 * Backend response normalizers. Each raw response needs to be passed
 * through these so the rest of the app can use plain strings for IDs
 * (regardless of whether the backend used flat strings or nested
 * { value: "..." } objects).
 */

interface RawFamilySummary {
  id: unknown;
  name: string;
  ownerUserId: unknown;
  memberCount?: number;
  createdAt: string;
}

interface RawFamilyMember {
  id: unknown;
  userId: unknown;
  email?: string;
  displayName: string;
  birthDate: string | null;
  role: number;
  relationship: number;
  joinedAt: string;
}

interface RawFamilyDetail {
  id: unknown;
  name: string;
  ownerUserId: unknown;
  createdAt: string;
  members: RawFamilyMember[];
}

/**
 * Raw shape of an Invitation as returned by the backend (admin view).
 * The "proposed" prefix matches the backend's Invitation entity:
 * a pending invitation proposes a Role and RelationshipType that will
 * become final only if accepted.
 */
interface RawInvitation {
  id: unknown;
  familyId: unknown;
  email: string;
  proposedRole: number;
  proposedRelationship: number;
  status: number;
  createdAt: string;
  expiresAt: string;
}

/**
 * Raw shape of InvitationDetails (inbox view). Same as Invitation but
 * enriched with familyName so the recipient can see which family
 * invited them without an extra round-trip.
 */
interface RawInvitationDetails extends RawInvitation {
  familyName: string;
}

export function normalizeFamilySummary(raw: RawFamilySummary): FamilySummary {
  return {
    id: unwrapId(raw.id),
    name: raw.name,
    ownerUserId: unwrapId(raw.ownerUserId),
    memberCount: raw.memberCount,
    createdAt: raw.createdAt,
  };
}

export function normalizeFamilyMember(raw: RawFamilyMember): FamilyMember {
  return {
    id: unwrapId(raw.id),
    userId: unwrapId(raw.userId),
    email: raw.email,
    displayName: raw.displayName,
    birthDate: raw.birthDate,
    role: raw.role as FamilyMember["role"],
    relationship: raw.relationship as FamilyMember["relationship"],
    joinedAt: raw.joinedAt,
  };
}

export function normalizeFamilyDetail(raw: RawFamilyDetail): FamilyDetail {
  return {
    id: unwrapId(raw.id),
    name: raw.name,
    ownerUserId: unwrapId(raw.ownerUserId),
    createdAt: raw.createdAt,
    members: raw.members.map(normalizeFamilyMember),
  };
}

export function normalizeInvitation(raw: RawInvitation): Invitation {
  return {
    id: unwrapId(raw.id),
    familyId: unwrapId(raw.familyId),
    email: raw.email,
    proposedRole: raw.proposedRole as Invitation["proposedRole"],
    proposedRelationship: raw.proposedRelationship as Invitation["proposedRelationship"],
    status: raw.status as Invitation["status"],
    createdAt: raw.createdAt,
    expiresAt: raw.expiresAt,
  };
}

export function normalizeInvitationDetails(raw: RawInvitationDetails): InvitationDetails {
  return {
    id: unwrapId(raw.id),
    familyId: unwrapId(raw.familyId),
    familyName: raw.familyName,
    email: raw.email,
    proposedRole: raw.proposedRole as InvitationDetails["proposedRole"],
    proposedRelationship: raw.proposedRelationship as InvitationDetails["proposedRelationship"],
    status: raw.status as InvitationDetails["status"],
    createdAt: raw.createdAt,
    expiresAt: raw.expiresAt,
  };
}
