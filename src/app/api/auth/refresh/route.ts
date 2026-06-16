import { NextResponse } from "next/server";
import { BackendError, callBackend, unwrapId } from "@/lib/api/backend";
import { clearSessionCookies, getRefreshToken, setSessionCookies } from "@/lib/auth/session";
import type { AuthTokens } from "@/types/api";

/**
 * POST /api/auth/refresh
 *
 * Reads the refresh token from the httpOnly cookie, asks the backend for a
 * new token pair, then rotates the cookies. The client never sees either token.
 *
 * Called by the TanStack Query client when a 401 is received on a request
 * that previously had a valid access token.
 */
export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json(
      { type: "about:blank", title: "No refresh token", status: 401 },
      { status: 401 }
    );
  }

  try {
    const tokens = await callBackend<RawTokens>("/api/v1/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });

    const normalized: AuthTokens = {
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      userId: unwrapId(tokens.userId),
    };

    await setSessionCookies(normalized);
    return NextResponse.json({ ok: true });
  } catch (error) {
    // If the refresh fails, the user's session is invalid. Clear cookies so
    // the next request bounces them to /login cleanly.
    await clearSessionCookies();

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
