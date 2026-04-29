import { redirect } from "react-router";
import { getCurrentUserId, destroySession } from "~/lib/session";
import { getUserById } from "~/services/userService";

// Configurable via env: comma-separated list, e.g. "tarento.com,example.com"
const raw = process.env.ALLOWED_EMAIL_DOMAINS ?? "tarento.com";
export const ALLOWED_DOMAINS = raw
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && ALLOWED_DOMAINS.includes(domain);
}

export async function requireAuth(request: Request) {
  const userId = await getCurrentUserId(request);
  if (!userId) {
    const url = new URL(request.url);
    throw redirect(
      `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`
    );
  }
  const user = getUserById(userId);
  if (!user) {
    // Session references a deleted user — clear it
    const cookie = await destroySession(request);
    throw redirect("/login", { headers: { "Set-Cookie": cookie } });
  }
  return user;
}
