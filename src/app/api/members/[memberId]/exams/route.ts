import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeExam } from "@/lib/api/normalizer-exam";
import { getAccessToken } from "@/lib/auth/session";

interface PaginatedRaw {
  items: Parameters<typeof normalizeExam>[0][];
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

/**
 * GET /api/members/[memberId]/exams
 *
 * Lists exams for a specific member. Backend paginates and supports
 * optional date range; we forward through query params.
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
  const qs = url.searchParams.toString();
  const backendUrl = `/api/v1/members/${memberId}/exams${qs ? `?${qs}` : ""}`;

  try {
    const raw = await callBackend<PaginatedRaw>(backendUrl, { accessToken });
    return NextResponse.json({
      items: raw.items.map(normalizeExam),
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /members/[memberId]/exams] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}

/**
 * POST /api/members/[memberId]/exams
 *
 * Registers a new exam. Defensive: don't normalize the response shape —
 * the client will refetch the list to get canonical state.
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
    await callBackend(`/api/v1/members/${memberId}/exams`, {
      method: "POST",
      body,
      accessToken,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[POST /members/[memberId]/exams] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
