import { ClerkMiddleware } from "@clerk/nextjs/server"

export default ClerkMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/login", "/api/webhooks(.*)"],
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

