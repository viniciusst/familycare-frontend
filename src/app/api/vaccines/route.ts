import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeVaccine } from "@/lib/api/normalizer-vaccine";
import { normalizeFamilyDetail } from "@/lib/api/normalizers";
import { getAccessToken } from "@/lib/auth/session";
import type { EnrichedVaccine } from "@/types/vaccines";

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

interface PaginatedRaw {
  items: Parameters<typeof normalizeVaccine>[0][];
}

/**
 * GET /api/vaccines
 *
 * Fans out per-family then per-member. Skips members the caller cannot
 * read (privacy rules / role-based 403) — only family-level failures
 * are surfaced as errors.
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

    const enriched: EnrichedVaccine[] = [];

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
          const vaccines = await callBackend<PaginatedRaw>(
            `/api/v1/members/${member.id}/vaccines?pageSize=200`,
            { accessToken }
          );
          for (const raw of vaccines.items) {
            const v = normalizeVaccine(raw);
            enriched.push({
              ...v,
              memberName: member.displayName,
              familyId: familyDetail.id,
              familyName: familyDetail.name,
            });
          }
        } catch (memberError) {
          console.warn(`[GET /vaccines] skipping member ${member.id}:`, memberError);
        }
      }
    }

    // Most recent applications first.
    enriched.sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1));

    return NextResponse.json({ items: enriched });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /vaccines] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
