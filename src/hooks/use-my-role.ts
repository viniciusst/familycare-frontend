"use client";

import { useMe } from "@/hooks/use-me";
import type { FamilyDetail, FamilySummary, Role } from "@/types/api";

/**
 * Derives the current user's role within a family by matching their
 * userId against the members list. Returns null while loading or if
 * the user isn't a member (shouldn't happen for visible families).
 *
 * The backend's family responses don't include a "myRole" field — they
 * could, but we keep it client-side so we don't depend on backend changes.
 */
export function useMyRole(family: FamilyDetail | undefined): Role | null {
  const { data: me } = useMe();
  if (!family || !me) return null;
  const member = family.members.find((m) => m.userId === me.id);
  return member?.role ?? null;
}

/**
 * Derives myRole for a FamilySummary (which doesn't include members).
 * Falls back to checking if the current user is the owner.
 */
export function useMyRoleFromSummary(family: FamilySummary | undefined): Role | null {
  const { data: me } = useMe();
  if (!family || !me) return null;
  if (family.ownerUserId === me.id) return 1; // Owner
  // Otherwise we can't tell from a summary alone — backend would have to
  // include the role in the list response. Return null so the UI shows
  // a neutral "Member" badge.
  return null;
}
