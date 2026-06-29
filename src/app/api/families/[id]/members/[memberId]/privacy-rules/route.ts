import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizePrivacyRule } from "@/lib/api/normalizer-privacy-rule";
import { getAccessToken } from "@/lib/auth/session";

/**
 * GET /api/families/[id]/members/[memberId]/privacy-rules
 *
 * Lists privacy rules configured for a member. Backend returns an
 * unpaginated array; we wrap in { items: [...] } for client consistency.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  const { id: familyId, memberId } = await params;

  try {
    const raw = await callBackend<Parameters<typeof normalizePrivacyRule>[0][]>(
      `/api/v1/families/${familyId}/members/${memberId}/privacy-rules`,
      { accessToken }
    );
    return NextResponse.json({
      items: raw.map(normalizePrivacyRule),
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /families/[familyId]/members/[memberId]/privacy-rules] unexpected:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
