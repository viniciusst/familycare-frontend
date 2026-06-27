import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeChronicCondition } from "@/lib/api/normalizer-chronic-condition";
import { getAccessToken } from "@/lib/auth/session";

type RawCondition = Parameters<typeof normalizeChronicCondition>[0];

/**
 * GET /api/members/[memberId]/conditions
 *
 * Lists chronic conditions for a specific member. Backend returns an
 * unpaginated IReadOnlyList (same as allergies), so we wrap in
 * { items: [...] } for client-side consistency. Supports ?activeOnly=
 * forwarded to the backend.
 */
export async function GET(request: Request, { params }: { params: Promise<{ memberId: string }> }) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  const { memberId } = await params;
  const url = new URL(request.url);
  const activeOnly = url.searchParams.get("activeOnly");
  const backendUrl = `/api/v1/members/${memberId}/chronic-conditions${
    activeOnly ? `?activeOnly=${encodeURIComponent(activeOnly)}` : ""
  }`;

  try {
    const raw = await callBackend<RawCondition[]>(backendUrl, { accessToken });
    return NextResponse.json({
      items: raw.map(normalizeChronicCondition),
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /members/[memberId]/conditions] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}

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
    await callBackend(`/api/v1/members/${memberId}/chronic-conditions`, {
      method: "POST",
      body,
      accessToken,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[POST /members/[memberId]/conditions] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
