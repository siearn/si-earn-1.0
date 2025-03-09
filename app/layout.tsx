import type React from "react"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SI Earn - Shopping, Insights, and Earning",
  description: "Earn money by watching ads and providing valuable feedback.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use a default key for static generation during build
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder-key-for-build"

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider publishableKey={publishableKey}>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}



import './globals.css'