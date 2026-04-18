import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "h12_session"

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (sessionCookie && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
}
