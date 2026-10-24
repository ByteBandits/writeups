export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Two worlds, never mix them:
//  - <Link> / router.push take ROUTE paths ("/tags/z3/") — Next adds basePath itself.
//  - raw <a>/<img>/import() take SITE urls — use siteUrl() (assets only).

/** route path -> site url. Idempotent: already-prefixed input is returned unchanged. */
export function siteUrl(path: string): string {
  if (!BASE_PATH || !path.startsWith("/")) return path;
  if (path === BASE_PATH || path.startsWith(BASE_PATH + "/")) return path;
  return BASE_PATH + path;
}

/** site url -> route path (strips basePath if present), for <Link>/router. */
export function routePath(url: string): string {
  if (!BASE_PATH) return url;
  if (url === BASE_PATH) return "/";
  return url.startsWith(BASE_PATH + "/") ? url.slice(BASE_PATH.length) : url;
}
