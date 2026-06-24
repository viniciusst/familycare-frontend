import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeInvitationDetails } from "@/lib/api/normalizers";
import { getAccessToken } from "@/lib/auth/session";

interface PaginatedRaw {
  items: Parameters<typeof normalizeInvitationDetails>[0][];
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

/**
 * GET /api/invitations
 *
 * Returns invitations addressed to the current authenticated user (filtered
 * by their email on the backend). Optional ?status= query param.
 */
export async function GET(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const backendUrl = `/api/v1/invitations${status ? `?status=${encodeURIComponent(status)}` : ""}`;

  try {
    const raw = await callBackend<PaginatedRaw>(backendUrl, { accessToken });
    return NextResponse.json({
      items: raw.items.map(normalizeInvitationDetails),
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /invitations] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
