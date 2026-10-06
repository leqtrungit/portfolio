export type RouteDecision =
  | { type: "next" }
  | { type: "redirect"; pathname: string }
  | { type: "rewrite"; pathname: string };

const BYPASS = [/^\/_next\//, /^\/media(\/|$)/, /\.[a-z0-9]+$/i];
const OG_IMAGE = /\/opengraph-image(-[\w-]+)?$/;

export function resolveLocaleRoute(pathname: string): RouteDecision {
  if (BYPASS.some((re) => re.test(pathname))) return { type: "next" };
  if (pathname === "/vi" || pathname.startsWith("/vi/")) return { type: "next" };
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    if (OG_IMAGE.test(pathname)) return { type: "next" };
    return { type: "redirect", pathname: pathname.slice(3) || "/" };
  }
  return { type: "rewrite", pathname: pathname === "/" ? "/en" : `/en${pathname}` };
}
