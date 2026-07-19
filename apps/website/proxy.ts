import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers + CSP.
 *
 * Both script-src and style-src need 'unsafe-inline':
 * - style-src: the site renders styling via inline `style={{...}}` props
 *   throughout (see docs/CONVENTIONS.md), and CSP has no per-element nonce
 *   mechanism for the `style` HTML attribute (only for <style>/<script>
 *   elements) — tightening this would mean rewriting the whole component
 *   layer onto stylesheets, out of scope here.
 * - script-src: tried a nonce + 'strict-dynamic' CSP first (Next's documented
 *   pattern, where the framework auto-nonces its own inline bootstrap/RSC
 *   scripts), but verified against a real prod build + browser that this
 *   Next.js/Turbopack version does *not* propagate the nonce to its own
 *   injected scripts — every chunk and inline script was blocked, a fully
 *   broken page. Falling back to 'unsafe-inline'. Given this site has no
 *   forms, no user input, and no dynamic/untrusted content rendering, the
 *   realistic XSS surface 'unsafe-inline' would expose is minimal — there's
 *   nowhere for an attacker to inject a payload in the first place.
 *
 * 'unsafe-eval' and `upgrade-insecure-requests` are dev-only/prod-only
 * respectively: Next's dev server uses eval() for Fast Refresh, and
 * upgrading to https would break `next dev` on plain http://localhost.
 *
 * connect-src allows the cross-origin analytics beacon (fetch + sendBeacon
 * are both governed by connect-src) to the blog-api origin.
 */
export function proxy(_request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";

  const csp = [
    "default-src 'self'",
    "connect-src 'self' https://blog-api.lequoctrung.id.vn",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
