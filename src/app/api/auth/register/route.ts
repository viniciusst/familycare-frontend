import { NextResponse } from "next/server";
import { BackendError, callBackend, unwrapId } from "@/lib/api/backend";
import { registerSchema } from "@/lib/schemas/auth";

/**
 * POST /api/auth/register
 *
 * Validates client-side fields, forwards to backend. We do NOT auto-login
 * after register — the user lands on /login to log in explicitly. This is
 * deliberate: a confirmation step is a good place to add email verification
 * later without changing the flow.
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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        type: "about:blank",
        title: "Validation failed",
        status: 400,
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // Strip confirmPassword before forwarding — backend doesn't know about it.
  const { confirmPassword: _ignore, ...payload } = parsed.data;

  try {
    const result = await callBackend<{ userId: unknown; email: string }>(
      "/api/v1/auth/register",
      { method: "POST", body: payload }
    );

    return NextResponse.json(
      { userId: unwrapId(result.userId), email: result.email },
      { status: 201 }
    );
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
