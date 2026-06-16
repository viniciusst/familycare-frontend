import { NextResponse } from "next/server";
import { BackendError, callBackend, unwrapId } from "@/lib/api/backend";
import { setSessionCookies } from "@/lib/auth/session";
import { loginSchema } from "@/lib/schemas/auth";
import type { AuthTokens } from "@/types/api";

/**
 * POST /api/auth/login
 *
 * Validates input, forwards to backend, and on success sets httpOnly cookies
 * for the access and refresh tokens. The browser never sees the raw tokens.
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

  const parsed = loginSchema.safeParse(body);
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

  try {
    const tokens = await callBackend<RawTokens>("/api/v1/auth/login", {
      method: "POST",
      body: parsed.data,
    });

    const normalized: AuthTokens = {
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      userId: unwrapId(tokens.userId),
    };

    await setSessionCookies(normalized);

    return NextResponse.json({ userId: normalized.userId });
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

interface RawTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  userId: unknown;
}
