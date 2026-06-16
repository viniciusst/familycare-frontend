import { NextResponse } from "next/server";
import { BackendError, callBackend, unwrapId } from "@/lib/api/backend";
import { getAccessToken } from "@/lib/auth/session";
import type { UserProfile } from "@/types/api";

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's profile, or 401 if not
 * signed in. Called by the app shell on mount to hydrate the user state.
 */
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  try {
    const raw = await callBackend<RawProfile>("/api/v1/auth/me", {
      accessToken,
    });

    const normalized: UserProfile = {
      id: unwrapId(raw.id),
      email: raw.email,
      preferredLanguage: raw.preferredLanguage,
      createdAt: raw.createdAt,
    };

    return NextResponse.json(normalized);
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

interface RawProfile {
  id: unknown;
  email: string;
  preferredLanguage: 1 | 2 | 3;
  createdAt: string;
}
