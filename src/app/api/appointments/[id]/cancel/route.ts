import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { getAccessToken } from "@/lib/auth/session";

/**
 * POST /api/appointments/[id]/cancel
 * Body: { reason?: string }
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
    body = {};
  }

  try {
    await callBackend(`/api/v1/appointments/${id}/cancel`, {
      method: "POST",
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
