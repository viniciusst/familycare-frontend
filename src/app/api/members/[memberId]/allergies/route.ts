import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeAllergy } from "@/lib/api/normalizer-allergy";
import { getAccessToken } from "@/lib/auth/session";

/**
 * GET /api/members/[memberId]/allergies
 *
 * Lists allergies for a specific member. Backend returns an unpaginated
 * list (IReadOnlyList<AllergyDto>), but we wrap it in { items: [...] } so
 * the client-side hooks have a consistent shape across entities.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  const { memberId } = await params;

  try {
    const raw = await callBackend<Parameters<typeof normalizeAllergy>[0][]>(
      `/api/v1/members/${memberId}/allergies`,
      { accessToken }
    );
    return NextResponse.json({
      items: raw.map(normalizeAllergy),
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /members/[memberId]/allergies] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}

/**
 * POST /api/members/[memberId]/allergies
 *
 * Registers a new allergy. Defensive: don't normalize the response.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  const { memberId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { type: "about:blank", title: "Invalid JSON body", status: 400 },
      { status: 400 }
    );
  }

  try {
    await callBackend(`/api/v1/members/${memberId}/allergies`, {
      method: "POST",
      body,
      accessToken,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[POST /members/[memberId]/allergies] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
