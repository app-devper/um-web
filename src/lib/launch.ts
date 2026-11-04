// Launching another System (um-api ADR-0011): the target app exchanges the
// ticket at <origin>/sso and starts its own session.

const LOOPBACK = new Set(["localhost", "127.0.0.1"]);

/** The address that opens a System with a one-time ticket, or null if its web URL is not a safe origin. */
export function launchUrl(webUrl: string, ticket: string): string | null {
  let url: URL;
  try {
    url = new URL(webUrl);
  } catch {
    return null;
  }
  const secure = url.protocol === "https:" || (url.protocol === "http:" && LOOPBACK.has(url.hostname));
  if (!secure || url.username || url.password) return null;
  return `${url.origin}/sso?ticket=${encodeURIComponent(ticket)}`;
}

const DEFAULT_RETURN = "/profile";

/**
 * Where /sso may send the user after the exchange: a path on this origin.
 * Anything that would leave it (`//host`, `/\host`, `https://…`) falls back to the profile.
 * A pathname that itself starts with `//` (reachable through `/..//host`) is rejected too,
 * because the browser would read the returned string as protocol-relative.
 */
export function safeReturnPath(requested: string | null, origin: string): string {
  if (!requested || !requested.startsWith("/")) return DEFAULT_RETURN;
  let url: URL;
  try {
    url = new URL(requested, origin);
  } catch {
    return DEFAULT_RETURN;
  }
  if (url.origin !== origin || url.pathname.startsWith("//")) return DEFAULT_RETURN;
  return `${url.pathname}${url.search}${url.hash}`;
}
