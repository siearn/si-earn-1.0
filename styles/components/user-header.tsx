"use client"

import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { ShoppingBag } from "lucide-react"

export default function UserHeader() {
  const { user, isLoaded } = useUser()
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    if (isLoaded && user) {
      // Fetch user data from our API
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data.balance) {
            setBalance(data.balance)
          }
        })
        .catch((err) => console.error("Error fetching user data:", err))
    }
  }, [isLoaded, user])

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xl font-bold">SI Earn</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/dashboard" className="text-sm font-medium">
            Dashboard
          </Link>
          <Link href="/earn" className="text-sm font-medium">
            Earn
          </Link>
          <Link href="/rewards" className="text-sm font-medium">
            Rewards
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Balance:</span>
              <span className="text-sm font-bold text-primary">${balance.toFixed(2)}</span>
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}

