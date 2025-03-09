import { authMiddleware } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export default authMiddleware({
  publicRoutes: ["/", "/login", "/signup", "/about", "/api/webhooks/clerk(.*)", "/api/webhooks/clerk/route"],
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/login", req.url)
      signInUrl.searchParams.set("redirect_url", req.url)
      return NextResponse.redirect(signInUrl)
    }

    // If the user is logged in and trying to access login/signup pages, redirect to dashboard
    if (auth.userId && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}

