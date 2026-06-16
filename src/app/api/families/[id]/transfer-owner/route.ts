import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { getAccessToken } from "@/lib/auth/session";

/**
 * PUT /api/families/[id]/transfer-owner
 *
 * Transfers family ownership to another member. Only the current owner
 * can call this. The previous owner becomes an Admin.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 },
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { type: "about:blank", title: "Invalid JSON body", status: 400 },
      { status: 400 },
    );
  }

  try {
    await callBackend(`/api/v1/families/${id}/transfer-owner`, {
      method: "PUT",
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
      { status: 500 },
    );
  }
}
