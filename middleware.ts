import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"

export function middleware(request) {
  // Get auth data from Clerk
  const { userId } = getAuth(request)

  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public routes that don't require authentication
  const isPublicRoute =
    path === "/" ||
    path === "/login" ||
    path === "/signup" ||
    path === "/about" ||
    path.startsWith("/api/webhooks/clerk")

  // If the user is not authenticated and the route is not public, redirect to login
  if (!userId && !isPublicRoute) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect_url", path)
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access login/signup, redirect to dashboard
  if (userId && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files, images, and api routes that don't need auth
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
}

