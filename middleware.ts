// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ENABLE_LOCK = process.env.SITE_LOCK === "1";
const PASS = process.env.SITE_PASSWORD || "";

export function middleware(req: NextRequest) {
  if (!ENABLE_LOCK) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // allow the unlock API, Next internals, and common static files
  if (
    pathname.startsWith("/api/__unlock") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap")
  ) {
    return NextResponse.next();
  }

  // already unlocked?
  const headerPass = req.headers.get("x-site-pass");
  const cookiePass = req.cookies.get("site-pass")?.value;
  if (PASS && (headerPass === PASS || cookiePass === PASS)) {
    return NextResponse.next();
  }

  // prompt for password
  const html = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{background:#0a0a0a;color:#eee;font-family:ui-sans-serif,system-ui;padding:2rem}
    input,button{padding:.6rem 1rem;border-radius:.6rem;background:#1b1b1b;color:#eee;border:1px solid #333}
    .card{max-width:480px;margin:5vh auto;padding:2rem;border:1px solid #333;border-radius:1rem;background:#0f0f0f}
  </style>
  <div class="card">
    <h1>Private Preview</h1>
    <p>Enter preview password to continue.</p>
    <form method="POST" action="/api/__unlock">
      <input type="password" name="p" placeholder="Password" autofocus />
      <button type="submit">Unlock</button>
    </form>
  </div>`;
  return new NextResponse(html, {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// run on everything except the unlock endpoint (extra safety)
export const config = { matcher: ["/((?!api/__unlock).*)"] };