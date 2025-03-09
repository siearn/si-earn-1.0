"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, DollarSign, Clock, Award } from "lucide-react"
import UserHeader from "@/components/user-header"

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        window.location.href = "/login"
        return
      } else {
        // Fetch user data from our API
        fetch("/api/user")
          .then((res) => res.json())
          .then((data) => {
            setUserData(data)
            setLoading(false)
          })
          .catch((err) => {
            console.error("Error fetching user data:", err)
            setLoading(false)
          })
      }
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Welcome back, {user?.firstName || userData?.name || "User"}!
            </h1>
            <p className="text-muted-foreground">We're glad to see you again. Here's an overview of your account.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${userData?.balance?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">+$2.50 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ads Watched</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData?.adsWatched || 0}</div>
                <p className="text-xs text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData?.watchTimeMinutes || 0} min</div>
                <p className="text-xs text-muted-foreground">+15 min from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData?.feedbackScore || 100}%</div>
                <p className="text-xs text-muted-foreground">+2% from last week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent ad watching and earning history</CardDescription>
              </CardHeader>
              <CardContent>
                {userData?.recentActivity && userData.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {userData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.date}</p>
                        </div>
                        <div className="font-medium">${activity.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BarChart2 className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No activity yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start watching ads to earn money and see your activity here.
                    </p>
                    <Link href="/earn" className="mt-4">
                      <Button>Start Earning</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Available Ads</CardTitle>
                <CardDescription>New opportunities to earn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">New Product Review</h4>
                      <span className="text-sm font-medium text-primary">$1.25</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Watch a 2-minute ad and provide feedback</p>
                    <Button size="sm" className="mt-3 w-full">
                      Watch Now
                    </Button>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Brand Survey</h4>
                      <span className="text-sm font-medium text-primary">$0.75</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Watch a 1-minute ad and answer 3 questions</p>
                    <Button size="sm" className="mt-3 w-full">
                      Watch Now
                    </Button>
                  </div>
                  <Link href="/earn" className="block text-center text-sm text-primary hover:underline">
                    View all available ads
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
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

