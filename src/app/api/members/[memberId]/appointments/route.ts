import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeAppointment } from "@/lib/api/normalizers-appointments";
import { getAccessToken } from "@/lib/auth/session";

/**
 * Backend's pagination envelope (verified against real response).
 */
interface PaginatedRaw {
  items: Parameters<typeof normalizeAppointment>[0][];
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

/**
 * GET /api/members/[memberId]/appointments
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
  const status = url.searchParams.get("status");
  const backendUrl = `/api/v1/members/${memberId}/appointments${
    status ? `?status=${encodeURIComponent(status)}` : ""
  }`;

  try {
    const raw = await callBackend<PaginatedRaw>(backendUrl, { accessToken });
    return NextResponse.json({
      items: raw.items.map(normalizeAppointment),
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /appointments] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}

/**
 * POST /api/members/[memberId]/appointments
 *
 * Backend's POST response shape is uncertain (could be 204 No Content,
 * just an id string, or a partial object). Instead of guessing, we don't
 * normalize at all here — we just acknowledge the create with `{ ok: true }`
 * and let the client refetch the list to get the canonical data.
 *
 * This is more resilient: works regardless of what the backend returns.
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
    // We don't care what the backend returns — just that it succeeds.
    // The client refetches the list afterwards.
    await callBackend<unknown>(`/api/v1/members/${memberId}/appointments`, {
      method: "POST",
      body,
      accessToken,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[POST /appointments] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
