import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { redirect } from "next/navigation"
import { getAuth } from "@clerk/nextjs/server"

export default function SignUpPage() {
  // Server component - use getAuth instead of auth
  const { userId } = getAuth()
  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xl font-bold">SI Earn</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-muted-foreground">Join SI Earn and start earning today</p>
          </div>
          <SignUp
            redirectUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            signInUrl="/login"
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-none",
              },
            }}
          />
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SI Earn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

