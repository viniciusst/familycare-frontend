import type { ProblemDetails } from "@/types/api";

/**
 * Server-side fetch helper for talking to the FamilyCare backend.
 *
 * This module is meant to be called from Next.js route handlers and Server
 * Components — NEVER from "use client" code, since it would expose the
 * BACKEND_API_URL and any auth headers to the browser.
 *
 * The browser talks to OUR Next.js API routes (under /api/...), and we
 * proxy them to the backend here. This gives us:
 *   - httpOnly cookies stay server-side
 *   - we can rewrite/transform responses (e.g. unwrap strongly-typed IDs)
 *   - we can mint cookies based on backend responses
 */

const BACKEND_URL = process.env.BACKEND_API_URL;

if (!BACKEND_URL) {
  throw new Error("BACKEND_API_URL is not set. Copy .env.example to .env.local.");
}

export class BackendError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails
  ) {
    super(problem.title || `Backend returned ${status}`);
    this.name = "BackendError";
  }
}

export interface BackendRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;
  acceptLanguage?: string;
}

/**
 * Calls the backend and returns the parsed JSON response. Throws
 * <see cref="BackendError"/> on non-2xx responses with the RFC 7807
 * ProblemDetails body attached.
 */
export async function callBackend<TResponse>(
  path: string,
  options: BackendRequestOptions = {}
): Promise<TResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (options.accessToken) {
    headers["Authorization"] = `Bearer ${options.accessToken}`;
  }
  if (options.acceptLanguage) {
    headers["Accept-Language"] = options.acceptLanguage;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  // 204 No Content is the only success without a body.
  if (response.status === 204) {
    return undefined as TResponse;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const problem: ProblemDetails = data ?? {
      type: "about:blank",
      title: response.statusText,
      status: response.status,
    };
    throw new BackendError(response.status, problem);
  }

  return data as TResponse;
}

/**
 * Strongly-typed IDs in the backend serialize as { value: "<guid>" }.
 * This helper unwraps that shape to a plain string so callers don't
 * have to think about it.
 */
export function unwrapId(input: unknown): string {
  if (typeof input === "string") return input;
  if (
    typeof input === "object" &&
    input !== null &&
    "value" in input &&
    typeof (input as { value: unknown }).value === "string"
  ) {
    return (input as { value: string }).value;
  }
  throw new Error(`Cannot unwrap strongly-typed ID from: ${JSON.stringify(input)}`);
}
