"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export function useAdmin() {
  const { isLoaded, isSignedIn } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/login")
        return
      }

      // Check if the user is an admin
      fetch("/api/admin/check")
        .then((res) => res.json())
        .then((data) => {
          setIsAdmin(data.isAdmin)
          setLoading(false)
          if (!data.isAdmin) {
            router.push("/dashboard")
          }
        })
        .catch((err) => {
          console.error("Error checking admin status:", err)
          setLoading(false)
          router.push("/dashboard")
        })
    }
  }, [isLoaded, isSignedIn, router])

  return { isAdmin, loading }
}

