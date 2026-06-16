import { NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware that protects authenticated routes. We check for the
 * presence of the access token cookie (we can't verify it here without
 * exposing the JWT key — that's the backend's job). If the cookie is
 * missing on a protected route, redirect to login.
 *
 * Conversely, if the user IS signed in and hits /login or /register,
 * send them to the dashboard.
 */

const PUBLIC_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has("fc_access");

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!hasAccessToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the originally-requested URL so we can redirect back after login.
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasAccessToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

/**
 * Match all routes except Next.js internals, API routes (which handle
 * their own auth), and static files.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
