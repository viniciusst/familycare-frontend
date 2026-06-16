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
 * Defensive parser: the backend's create-family response shape isn't fully
 * known yet. We try the strict normalizer first, but if it throws we still
 * return success (201) because the family WAS created — we just can't tell
 * the client the full details. The client will refetch the list.
 *
 * We also log the raw response so we can see what the backend actually returns
 * and fix the type definitions properly later.
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
    const raw = await callBackend<unknown>("/api/v1/families", {
      method: "POST",
      body,
      accessToken,
    });

    // Log the actual shape so we can see it in `npm run dev` console.
    console.log("[POST /families] backend response shape:", JSON.stringify(raw));

    // Try to normalize, but tolerate failure.
    try {
      const normalized = normalizeFamilySummary(
        raw as Parameters<typeof normalizeFamilySummary>[0]
      );
      return NextResponse.json(normalized, { status: 201 });
    } catch (normalizeError) {
      console.warn("[POST /families] could not normalize response, returning raw:", normalizeError);
      // Best-effort: return whatever the backend gave us with status 201.
      // The client's list will refetch and pick up the new family.
      return NextResponse.json(raw, { status: 201 });
    }
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
