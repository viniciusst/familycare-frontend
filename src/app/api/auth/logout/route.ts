import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { clearSessionCookies, getAccessToken, getRefreshToken } from "@/lib/auth/session";

/**
 * POST /api/auth/logout
 *
 * Tells the backend to revoke the refresh token (so it can't be used to
 * rotate new sessions even if leaked), then clears our cookies. We don't
 * surface backend errors to the client — local cookies are cleared either way.
 */
export async function POST() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (accessToken && refreshToken) {
    try {
      await callBackend("/api/v1/auth/logout", {
        method: "POST",
        body: { refreshToken },
        accessToken,
      });
    } catch (error) {
      // Best-effort revocation; even on backend error we still clear cookies.
      if (!(error instanceof BackendError)) {
        console.error("Logout call failed:", error);
      }
    }
  }

  await clearSessionCookies();
  return NextResponse.json({ ok: true });
}
