import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { getAccessToken } from "@/lib/auth/session";

/**
 * DELETE /api/families/[id]/invitations/[invitationId]
 *
 * Revokes a pending invitation. Owner/Admin only.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; invitationId: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 },
    );
  }

  const { id, invitationId } = await params;

  try {
    await callBackend(`/api/v1/families/${id}/invitations/${invitationId}`, {
      method: "DELETE",
      accessToken,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 },
    );
  }
}
