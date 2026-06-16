import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";

/**
 * POST /api/auth/register
 *
 * Proxies registration to the backend. The backend response includes
 * tokens, but we don't store them — registration just creates the
 * account. The user must log in afterwards.
 */
export async function POST(request: Request) {
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
    // Call backend, ignore the returned tokens — user logs in next.
    await callBackend("/api/v1/auth/register", { method: "POST", body });
    return NextResponse.json({ ok: true }, { status: 201 });
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
