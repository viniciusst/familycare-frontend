/**
 * Wire-format types that mirror the backend DTOs. These are intentionally
 * decoupled from the backend C# types — if the API contract changes, this
 * file is where we adapt. Keep these in sync with the OpenAPI definition
 * served at /openapi/v1.json.
 *
 * Note: the backend serializes strongly-typed IDs (UserId, FamilyId, etc.)
 * as nested objects { value: string }. We unwrap them in the API client so
 * the rest of the app sees plain strings.
 */

// =============================================================================
// Auth
// =============================================================================

export type SupportedLanguage = 1 | 2 | 3;
// 1 = pt-BR, 2 = en-CA, 3 = fr-CA

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  userId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  preferredLanguage: SupportedLanguage;
  createdAt: string;
}

// =============================================================================
// Problem details (RFC 7807)
// =============================================================================

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  code?: string;
  // Validation problems carry per-field errors:
  errors?: Record<string, string[]>;
}
