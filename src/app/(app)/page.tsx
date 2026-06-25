import { redirect } from "next/navigation";

/**
 * Root of the authenticated app shell. Redirects to /dashboard so that
 * /(app) and /dashboard both land on the same page without duplicating
 * the dashboard implementation.
 */
export default function AppRootPage() {
  redirect("/dashboard");
}
