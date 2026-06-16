import { cookies } from "next/headers";
import type { AuthTokens } from "@/types/api";

/**
 * Cookie names. We split tokens across two cookies because they have very
 * different lifetimes and exposure characteristics:
 *  - access token: short-lived (~60 min), included on every API request
 *  - refresh token: long-lived (~30 days), used only by the refresh endpoint
 *
 * Both are httpOnly + SameSite=Lax + Secure (in production) — they cannot be
 * read from JavaScript, which neutralizes XSS-based token theft.
 */
const ACCESS_COOKIE = "fc_access";
const REFRESH_COOKIE = "fc_refresh";

const isProd = process.env.NODE_ENV === "production";

/**
 * Common cookie options. httpOnly + SameSite=Lax = the browser sends the
 * cookie on top-level navigation (so login redirects work) but blocks it
 * on cross-site requests (CSRF mitigation).
 */
const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

export async function setSessionCookies(tokens: AuthTokens): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    expires: new Date(tokens.accessTokenExpiresAt),
  });

  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    expires: new Date(tokens.refreshTokenExpiresAt),
  });
}

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
