import { NextResponse, type NextRequest } from "next/server";

// Quick gate: no sign-in cookie, no admin pages. The API still checks every request for real.
export function proxy(req: NextRequest) {
  if (!req.cookies.get("ll_admin") && req.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/|brand/|favicon.ico).*)"] };
