"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/hooks/use-admin"
import UserHeader from "@/components/user-header"
import { Users, BarChart2, DollarSign, Clock, TrendingUp, Eye } from "lucide-react"

export default function AdminDashboardPage() {
  const { isAdmin, loading } = useAdmin()
  const [analytics, setAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/admin/analytics")
        .then((res) => res.json())
        .then((data) => {
          setAnalytics(data)
          setLoadingAnalytics(false)
        })
        .catch((err) => {
          console.error("Error fetching analytics:", err)
          setLoadingAnalytics(false)
        })
    }
  }, [isAdmin])

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading admin dashboard...</p>
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
            <h1 className="text-4xl font-bold tracking-tight mb-2">Administrator Dashboard</h1>
            <p className="text-muted-foreground">Manage users, view analytics, and monitor platform activity.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingAnalytics ? (
                    <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
                  ) : (
                    analytics?.counts.users.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loadingAnalytics ? (
                    <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  ) : (
                    "Active platform users"
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ads Watched</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingAnalytics ? (
                    <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
                  ) : (
                    analytics?.counts.adWatches.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loadingAnalytics ? (
                    <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  ) : (
                    "Total ad views"
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingAnalytics ? (
                    <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
                  ) : (
                    analytics?.counts.ads.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loadingAnalytics ? (
                    <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  ) : (
                    "Available advertisements"
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingAnalytics ? (
                    <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
                  ) : (
                    `$${analytics?.counts.totalEarnings.toFixed(2)}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loadingAnalytics ? (
                    <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  ) : (
                    "Total rewards distributed"
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="ads">Ads</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Users</CardTitle>
                  <CardDescription>Users with the highest engagement on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded bg-muted"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analytics?.mostActiveUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{user._count.adWatches} ads watched</p>
                              <p className="text-sm text-muted-foreground">${user.balance.toFixed(2)} earned</p>
                            </div>
                            <Link href={`/admin/users/${user.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      <div className="text-center">
                        <Link href="/admin/users">
                          <Button variant="link">View All Users</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ads" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Ads</CardTitle>
                  <CardDescription>Ads with the highest view counts</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded bg-muted"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analytics?.topAds.map((ad) => (
                        <div key={ad.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{ad.title}</h4>
                            <p className="text-sm text-muted-foreground">{ad.category}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{ad.watchCount} views</p>
                              <p className="text-sm text-muted-foreground">${ad.reward.toFixed(2)} per view</p>
                            </div>
                            <Link href={`/admin/ads/${ad.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      <div className="text-center">
                        <Link href="/admin/ads">
                          <Button variant="link">View All Ads</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Platform Activity</CardTitle>
                  <CardDescription>Overview of user signups and ad watches</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div className="space-y-8">
                      <div className="h-64 animate-pulse rounded bg-muted"></div>
                      <div className="h-64 animate-pulse rounded bg-muted"></div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">User Signups (Last 30 Days)</h3>
                        <div className="h-64 bg-muted/30 rounded-lg p-4">
                          {/* This would be a chart in a real implementation */}
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">Chart visualization would go here</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Ad Watches (Last 30 Days)</h3>
                        <div className="h-64 bg-muted/30 rounded-lg p-4">
                          {/* This would be a chart in a real implementation */}
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">Chart visualization would go here</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link href="/admin/users">
                    <Button className="w-full" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link href="/admin/create">
                    <Button className="w-full" variant="outline">
                      <BarChart2 className="mr-2 h-4 w-4" />
                      Create New Ad
                    </Button>
                  </Link>
                  <Link href="/admin/reports">
                    <Button className="w-full" variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Reports
                    </Button>
                  </Link>
                  <Link href="/admin/settings">
                    <Button className="w-full" variant="outline">
                      <Clock className="mr-2 h-4 w-4" />
                      Platform Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current platform health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">API Services</span>
                    </div>
                    <span className="text-sm text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <span className="text-sm text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Authentication</span>
                    </div>
                    <span className="text-sm text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Storage</span>
                    </div>
                    <span className="text-sm text-green-500">Operational</span>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SI Earn. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>
      </footer>
    </div>
  )
}

