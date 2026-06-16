import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeInvitation } from "@/lib/api/normalizers";
import { getAccessToken } from "@/lib/auth/session";

/**
 * POST /api/families/[id]/invitations
 *
 * Sends an invitation by email. Owner/Admin only.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  const { id } = await params;

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
    const raw = await callBackend<Parameters<typeof normalizeInvitation>[0]>(
      `/api/v1/families/${id}/invitations`,
      { method: "POST", body, accessToken }
    );
    return NextResponse.json(normalizeInvitation(raw), { status: 201 });
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
