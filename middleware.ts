import { authMiddleware } from "@clerk/nextjs/server"

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/login", "/api/webhooks(.*)"],
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

