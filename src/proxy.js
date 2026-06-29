import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const session = getSessionCookie(request);

  // Logged-in users can't visit login/signup
  if (
    session &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Dashboard protection
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  return NextResponse.next();
}

export const config = {
   matcher: [
    '/dashboard/:role*',
    '/dashboard/:role*/:nav*',
    '/tickets/alltickets/:id*'
  ],
};