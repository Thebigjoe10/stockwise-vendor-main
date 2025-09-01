import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const vendor_token = req.cookies.get("vendor_token");

  // Unauthenticated vendors trying to access /vendor routes
  if (pathname.startsWith("/vendor") && !vendor_token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // If already logged in, block /signin and /signup
  if ((pathname === "/signin" || pathname === "/signup") && vendor_token) {
    return NextResponse.redirect(new URL("/vendor/dashboard", req.url));
  }

  return NextResponse.next();
}
