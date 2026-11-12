// Best-effort client IP for rate-limiting — Next.js's Request has no
// built-in `.ip`, so this reads the standard proxy headers instead. Good
// enough for a rate-limit key; not meant to be spoof-proof identity.
//
// Takes the LAST entry of X-Forwarded-For: each proxy hop appends the peer
// IP it directly observed, so the rightmost value is the one this app's own
// reverse proxy actually observed (the leftmost is attacker-controlled).
// Assumes exactly one trusted proxy hop in front of this app.
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    return ips[ips.length - 1].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
