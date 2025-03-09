import { createMiddleware } from "@clerk/nextjs/server"

export default createMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/login", "/api/webhooks(.*)"],
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

