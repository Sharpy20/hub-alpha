// Personal links are user-typed and stored in localStorage, so treat them as untrusted:
// only http(s) may reach window.open/href (a javascript: URL would execute as script).
export function sanitizeExternalUrl(raw: string): string {
  const url = raw.trim();
  if (url === "" || url === "#") return "#";
  if (/^https?:\/\//i.test(url)) return url;
  // No scheme at all (e.g. "focus.derbyshirehealthcareft.nhs.uk/...") - assume https
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) return `https://${url}`;
  return "#";
}
