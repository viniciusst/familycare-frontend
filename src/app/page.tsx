import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth/session";

/**
 * Landing page. If the user has a session cookie, send them to the
 * dashboard; otherwise to login. This keeps "/" out of the public surface
 * — there's no marketing page yet, just routing.
 */
export default async function HomePage() {
  const token = await getAccessToken();
  if (token) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
