import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeChronicCondition } from "@/lib/api/normalizer-chronic-condition";
import { normalizeFamilyDetail } from "@/lib/api/normalizers";
import { getAccessToken } from "@/lib/auth/session";
import type { EnrichedChronicCondition } from "@/types/chronic-conditions";

interface RawFamilySummary {
  id: unknown;
  name: string;
  ownerUserId: unknown;
  memberCount?: number;
  createdAt: string;
}

interface FamiliesListRaw {
  items: RawFamilySummary[];
}

type RawCondition = Parameters<typeof normalizeChronicCondition>[0];

/**
 * GET /api/conditions
 *
 * Aggregator for chronic conditions across all families/members.
 * Same defensive pattern: per-member 403s are silently skipped.
 */
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  try {
    const families = await callBackend<FamiliesListRaw>("/api/v1/families", {
      accessToken,
    });

    const enriched: EnrichedChronicCondition[] = [];

    for (const familyRaw of families.items) {
      const familyId =
        typeof familyRaw.id === "object" && familyRaw.id !== null
          ? (familyRaw.id as { value: string }).value
          : String(familyRaw.id);

      const familyDetailRaw = await callBackend<Parameters<typeof normalizeFamilyDetail>[0]>(
        `/api/v1/families/${familyId}`,
        { accessToken }
      );
      const familyDetail = normalizeFamilyDetail(familyDetailRaw);

      for (const member of familyDetail.members) {
        try {
          const conditions = await callBackend<RawCondition[]>(
            `/api/v1/members/${member.id}/chronic-conditions`,
            { accessToken }
          );
          for (const raw of conditions) {
            const c = normalizeChronicCondition(raw);
            enriched.push({
              ...c,
              memberName: member.displayName,
              familyId: familyDetail.id,
              familyName: familyDetail.name,
            });
          }
        } catch (memberError) {
          console.warn(`[GET /conditions] skipping member ${member.id}:`, memberError);
        }
      }
    }

    // Active conditions first, then by diagnosis date descending.
    enriched.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.diagnosedAt < b.diagnosedAt ? 1 : -1;
    });

    return NextResponse.json({ items: enriched });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /conditions] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
