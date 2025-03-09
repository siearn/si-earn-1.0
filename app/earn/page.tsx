"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Clock, Filter } from "lucide-react"
import UserHeader from "@/components/user-header"
import AdPlayer from "@/components/ad-player"
import { redirect } from "next/navigation"

// Define the Ad type
interface Ad {
  id: string
  title: string
  description: string
  duration: number
  reward: number
  category: string
  difficulty: string
  videoUrl: string
  questions: {
    id: string
    question: string
    options: string[]
  }[]
}

// Define the WatchHistory type
interface WatchHistory {
  title: string
  date: string
  amount: number
}

export default function EarnPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [ads, setAds] = useState<Ad[]>([])
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [activeTab, setActiveTab] = useState("available")
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        redirect("/login")
      } else {
        // Fetch ads from our API
        fetch("/api/ads")
          .then((res) => res.json())
          .then((data) => {
            setAds(data)
            setLoading(false)
          })
          .catch((err) => {
            console.error("Error fetching ads:", err)
            setLoading(false)
          })

        // Fetch user data to get watch history
        fetch("/api/user")
          .then((res) => res.json())
          .then((data) => {
            if (data.recentActivity) {
              setWatchHistory(data.recentActivity)
            }
          })
          .catch((err) => console.error("Error fetching user data:", err))
      }
    }
  }, [isLoaded, isSignedIn])

  const handleAdSelect = (ad: Ad) => {
    setSelectedAd(ad)
  }

  const handleAdComplete = (adId: string, analyticsData: any) => {
    // Send the analytics data to our API
    fetch("/api/ads/watch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adId,
        watchTime: analyticsData.watchTime,
        answers: analyticsData.answers,
        feedback: analyticsData.feedback,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Refresh user data
          fetch("/api/user")
            .then((res) => res.json())
            .then((userData) => {
              if (userData.recentActivity) {
                setWatchHistory(userData.recentActivity)
              }
            })
            .catch((err) => console.error("Error fetching user data:", err))
        }
      })
      .catch((err) => console.error("Error recording ad watch:", err))

    // Reset selected ad
    setSelectedAd(null)
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />
      <main className="flex-1 container py-8">
        {selectedAd ? (
          <AdPlayer ad={selectedAd} onComplete={handleAdComplete} onCancel={() => setSelectedAd(null)} />
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Earn Money</h1>
              <p className="text-muted-foreground">Watch ads, answer questions, and earn rewards.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="available">Available Ads</TabsTrigger>
                <TabsTrigger value="history">Watch History</TabsTrigger>
              </TabsList>
              <TabsContent value="available" className="space-y-4 pt-4">
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {ads.map((ad) => (
                    <Card key={ad.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                        </div>
                        {ad.videoUrl ? (
                          <video
                            src={ad.videoUrl}
                            className="h-full w-full object-cover opacity-50"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(ad.category)}`}
                            alt={ad.title}
                            className="h-full w-full object-cover opacity-50"
                          />
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{ad.title}</CardTitle>
                          <span className="text-sm font-medium text-primary">${ad.reward.toFixed(2)}</span>
                        </div>
                        <CardDescription>{ad.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {Math.floor(ad.duration / 60)}:{(ad.duration % 60).toString().padStart(2, "0")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {ad.difficulty}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => handleAdSelect(ad)}>
                          Watch & Earn
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="history" className="pt-4">
                {watchHistory.length > 0 ? (
                  <div className="space-y-4">
                    {watchHistory.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Play className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.date}</p>
                        </div>
                        <div className="font-medium text-primary">${activity.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Play className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No watch history yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Start watching ads to earn money and build your watch history.
                    </p>
                    <Button className="mt-4" onClick={() => setActiveTab("available")}>
                      Browse Available Ads
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SI Earn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

