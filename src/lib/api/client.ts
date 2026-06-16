import type { ProblemDetails } from "@/types/api";

/**
 * Thin fetch wrapper for "use client" code. Always talks to OUR Next.js
 * API routes (relative paths), never directly to the backend. Cookies
 * are sent automatically because we are on the same origin.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails,
  ) {
    super(problem.title);
    this.name = "ApiError";
  }
}

export interface ClientFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function clientFetch<TResponse>(
  path: string,
  options: ClientFetchOptions = {},
): Promise<TResponse> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  if (response.status === 204) return undefined as TResponse;

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const problem: ProblemDetails = data ?? {
      type: "about:blank",
      title: response.statusText,
      status: response.status,
    };
    throw new ApiError(response.status, problem);
  }

  return data as TResponse;
}
