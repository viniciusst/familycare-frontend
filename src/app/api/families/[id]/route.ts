import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeFamilyDetail } from "@/lib/api/normalizers";
import { getAccessToken } from "@/lib/auth/session";

/**
 * GET /api/families/[id]
 *
 * Returns the family with all its members.
 */
export async function GET(
  _request: Request,
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

  try {
    const raw = await callBackend<Parameters<typeof normalizeFamilyDetail>[0]>(
      `/api/v1/families/${id}`,
      { accessToken },
    );
    return NextResponse.json(normalizeFamilyDetail(raw));
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

/**
 * PATCH /api/families/[id]
 *
 * Renames the family. Owner/Admin only (enforced by backend).
 * Backend expects PATCH on /families/{id} with { name: "..." }.
 */
export async function PATCH(
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
    await callBackend(`/api/v1/families/${id}`, {
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
      { status: 500 },
    );
  }
}
