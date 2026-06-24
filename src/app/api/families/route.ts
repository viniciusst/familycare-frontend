import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeFamilySummary } from "@/lib/api/normalizers";
import { getAccessToken } from "@/lib/auth/session";

interface PaginatedRaw {
  items: Parameters<typeof normalizeFamilySummary>[0][];
  pageNumber?: number;
  pageSize?: number;
  totalItems?: number;
}

/**
 * GET /api/families
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
    const raw = await callBackend<PaginatedRaw>("/api/v1/families", {
      accessToken,
    });
    return NextResponse.json({
      items: raw.items.map(normalizeFamilySummary),
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}

/**
 * POST /api/families
 *
 * Backend response shape isn't trusted (strongly-typed IDs, denormalization
 * differences, etc). Return { ok: true } and let the client refetch the
 * list to get canonical data. Consistent with Appointments/Invitations.
 */
export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

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
    await callBackend(`/api/v1/families`, {
      method: "POST",
      body,
      accessToken,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[POST /families] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
