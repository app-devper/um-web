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
