"use client";

import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type { UserProfile } from "@/types/api";

/**
 * Fetches the currently authenticated user. Used by the app shell to
 * hydrate UI elements (avatar, email, language preference).
 *
 * Returns null on 401 (not signed in) — the middleware should already
 * have redirected to /login, but this is a safety net.
 */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await clientFetch<UserProfile>("/api/auth/me");
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // profile doesn't change often
  });
}
