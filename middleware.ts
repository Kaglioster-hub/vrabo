import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = (process.env.NEXT_PUBLIC_LOCALES || "it,en").split(",");
const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "it";

const csp = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "script-src 'self' 'unsafe-inline' https://plausible.io https://*.vercel-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://plausible.io https://*.vercel-analytics.com",
  "font-src 'self' data:",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.paypal.com https://*.stripe.com"
].join("; ");

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow API & static
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    const res = NextResponse.next();
    res.headers.set("Content-Security-Policy", csp);
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    return res;
  }

  // i18n routing
  const hasLocale = LOCALES.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  const url = req.nextUrl.clone();
  if (!hasLocale) {
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    const res = NextResponse.redirect(url);
    res.headers.set("Content-Security-Policy", csp);
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  return res;
}

export const config = { matcher: ["/((?!_next|.*\..*).*)"] };

