import { unwrapId } from "./backend";
import type { FamilyDetail, FamilyMember, FamilySummary, Invitation } from "@/types/api";

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

interface RawInvitation {
  id: unknown;
  familyId: unknown;
  familyName: string;
  email: string;
  role: number;
  relationship: number;
  status: number;
  invitedByUserId: unknown;
  invitedAt: string;
  expiresAt: string;
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
    familyName: raw.familyName,
    email: raw.email,
    role: raw.role as Invitation["role"],
    relationship: raw.relationship as Invitation["relationship"],
    status: raw.status as Invitation["status"],
    invitedByUserId: unwrapId(raw.invitedByUserId),
    invitedAt: raw.invitedAt,
    expiresAt: raw.expiresAt,
  };
}
