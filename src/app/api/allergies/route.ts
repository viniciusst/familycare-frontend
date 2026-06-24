import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeAllergy } from "@/lib/api/normalizer-allergy";
import { normalizeFamilyDetail } from "@/lib/api/normalizers";
import { getAccessToken } from "@/lib/auth/session";
import type { EnrichedAllergy } from "@/types/allergies";

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

type RawAllergy = Parameters<typeof normalizeAllergy>[0];

/**
 * GET /api/allergies
 *
 * Aggregator: fans out per-family then per-member to fetch all allergies
 * the authenticated user can see. Backend returns an unpaginated array
 * per member (IReadOnlyList<AllergyDto>).
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

    const enriched: EnrichedAllergy[] = [];

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
          const allergies = await callBackend<RawAllergy[]>(
            `/api/v1/members/${member.id}/allergies`,
            { accessToken }
          );
          for (const raw of allergies) {
            const allergy = normalizeAllergy(raw);
            enriched.push({
              ...allergy,
              memberName: member.displayName,
              familyId: familyDetail.id,
              familyName: familyDetail.name,
            });
          }
        } catch (memberError) {
          // Skip individual member failures — privacy rules may hide some.
          console.warn(`[GET /allergies] skipping member ${member.id}:`, memberError);
        }
      }
    }

    // Sort by severity descending (most severe first), then by substance asc.
    enriched.sort((a, b) => {
      if (a.severity !== b.severity) return b.severity - a.severity;
      return a.substance.localeCompare(b.substance);
    });

    return NextResponse.json({ items: enriched });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /allergies] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
