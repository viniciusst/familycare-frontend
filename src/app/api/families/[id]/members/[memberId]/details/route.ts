import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { getAccessToken } from "@/lib/auth/session";

/**
 * PATCH /api/families/[id]/members/[memberId]/details
 *
 * Updates editable details of a family member (displayName, birthDate,
 * relationship). Backend authorization:
 * - Owner/Admin can edit anyone
 * - Regular members can edit only themselves
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  const { id, memberId } = await params;

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
    await callBackend(`/api/v1/families/${id}/members/${memberId}/details`, {
      method: "PATCH",
      body,
      accessToken,
    });
    return NextResponse.json({ ok: true });
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
