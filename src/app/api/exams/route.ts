import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeExam } from "@/lib/api/normalizer-exam";
import { normalizeFamilyDetail } from "@/lib/api/normalizers";
import { getAccessToken } from "@/lib/auth/session";
import type { EnrichedExam } from "@/types/exams";

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

interface PaginatedExamsRaw {
  items: Parameters<typeof normalizeExam>[0][];
}

/**
 * GET /api/exams
 *
 * Aggregator: fans out per-family then per-member to fetch all exams the
 * authenticated user can see, then enriches each with member/family context
 * for display in a unified list. Same pattern as the appointments aggregator.
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
    // 1. List user's families.
    const families = await callBackend<FamiliesListRaw>("/api/v1/families", {
      accessToken,
    });

    // 2. For each family, fetch the detail (to get members) and then
    //    per-member exams.
    const enriched: EnrichedExam[] = [];

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
          const exams = await callBackend<PaginatedExamsRaw>(
            `/api/v1/members/${member.id}/exams?pageSize=200`,
            { accessToken }
          );
          for (const raw of exams.items) {
            const exam = normalizeExam(raw);
            enriched.push({
              ...exam,
              memberName: member.displayName,
              familyId: familyDetail.id,
              familyName: familyDetail.name,
            });
          }
        } catch (memberError) {
          // Skip individual member failures (privacy rule, etc) — the user
          // may not have access to every member's exams.
          console.warn(`[GET /exams] skipping member ${member.id}:`, memberError);
        }
      }
    }

    // Sort by examDate descending (most recent first).
    enriched.sort((a, b) => (a.examDate < b.examDate ? 1 : -1));

    return NextResponse.json({ items: enriched });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /exams] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
