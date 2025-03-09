"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAdmin } from "@/hooks/use-admin"
import UserHeader from "@/components/user-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, BarChart2, Clock, DollarSign, Eye, Calendar } from "lucide-react"

export default function UserDetailPage() {
  const { isAdmin, loading } = useAdmin()
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    if (isAdmin && params.id) {
      fetchUserDetails()
    }
  }, [isAdmin, params.id])

  const fetchUserDetails = async () => {
    setLoadingUser(true)
    try {
      const response = await fetch(`/api/admin/users/${params.id}`)
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error("Error fetching user details:", error)
    } finally {
      setLoadingUser(false)
    }
  }

  const handleAdminToggle = async (isAdmin) => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAdmin }),
      })

      if (response.ok) {
        // Update the user state with the new admin status
        setUser((prev) => ({ ...prev, isAdmin }))
      }
    } catch (error) {
      console.error("Error updating admin status:", error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading user details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          </div>

          {loadingUser ? (
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded bg-muted"></div>
              <div className="h-64 animate-pulse rounded bg-muted"></div>
            </div>
          ) : user ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch id="admin-mode" checked={user.isAdmin} onCheckedChange={handleAdminToggle} />
                        <Label htmlFor="admin-mode">Admin Access</Label>
                      </div>
                      <Badge
                        variant={user.isAdmin ? "default" : "outline"}
                        className={user.isAdmin ? "bg-primary" : ""}
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                      <DollarSign className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-2xl font-bold">${user.balance.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                      <Eye className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Ads Watched</p>
                      <p className="text-2xl font-bold">{user.adsWatched}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                      <Clock className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Watch Time</p>
                      <p className="text-2xl font-bold">{user.watchTimeMinutes} min</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                      <Calendar className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="text-lg font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ad Watch History</CardTitle>
                      <CardDescription>Complete history of ads watched by this user</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user.adWatches.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ad Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-center">Watch Time</TableHead>
                                <TableHead className="text-center">Reward</TableHead>
                                <TableHead className="text-center">Completed</TableHead>
                                <TableHead className="text-center">Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {user.adWatches.map((watch) => (
                                <TableRow key={watch.id}>
                                  <TableCell className="font-medium">{watch.ad.title}</TableCell>
                                  <TableCell>{watch.ad.category}</TableCell>
                                  <TableCell className="text-center">
                                    {Math.floor(watch.watchTime / 60)}:
                                    {(watch.watchTime % 60).toString().padStart(2, "0")}
                                  </TableCell>
                                  <TableCell className="text-center">${watch.ad.reward.toFixed(2)}</TableCell>
                                  <TableCell className="text-center">
                                    {watch.completed ? (
                                      <Badge variant="default" className="bg-green-500">
                                        Completed
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">Incomplete</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">{formatDate(watch.createdAt)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">No activity yet</h3>
                          <p className="text-sm text-muted-foreground mt-1">This user hasn't watched any ads yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="earnings" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Earnings History</CardTitle>
                      <CardDescription>Complete history of earnings for this user</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user.adWatches.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ad Title</TableHead>
                                <TableHead className="text-center">Reward</TableHead>
                                <TableHead className="text-center">Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {user.adWatches.map((watch) => (
                                <TableRow key={watch.id}>
                                  <TableCell className="font-medium">{watch.ad.title}</TableCell>
                                  <TableCell className="text-center">${watch.ad.reward.toFixed(2)}</TableCell>
                                  <TableCell className="text-center">{formatDate(watch.createdAt)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">No earnings yet</h3>
                          <p className="text-sm text-muted-foreground mt-1">This user hasn't earned any rewards yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Analytics</CardTitle>
                      <CardDescription>Detailed analytics for this user</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Activity Over Time</h3>
                          <div className="h-64 bg-muted/30 rounded-lg p-4">
                            {/* This would be a chart in a real implementation */}
                            <div className="h-full flex items-center justify-center">
                              <p className="text-muted-foreground">Activity chart would go here</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-4">Category Preferences</h3>
                          <div className="h-64 bg-muted/30 rounded-lg p-4">
                            {/* This would be a chart in a real implementation */}
                            <div className="h-full flex items-center justify-center">
                              <p className="text-muted-foreground">Category preference chart would go here</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card>
                <CardHeader>
                  <CardTitle>User Responses</CardTitle>
                  <CardDescription>Answers provided by the user for ad questions</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.adWatches.some((watch) => watch.answers.length > 0) ? (
                    <div className="space-y-6">
                      {user.adWatches.map(
                        (watch) =>
                          watch.answers.length > 0 && (
                            <div key={watch.id} className="rounded-lg border p-4">
                              <h3 className="text-lg font-medium mb-2">{watch.ad.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Watched on {formatDate(watch.createdAt)}
                              </p>

                              <div className="space-y-4">
                                {watch.answers.map((answer) => (
                                  <div key={answer.id} className="rounded-lg bg-muted/30 p-3">
                                    <p className="font-medium mb-1">{answer.question.question}</p>
                                    <p className="text-sm">
                                      Answer: <span className="font-medium">{answer.answer}</span>
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {watch.feedback && (
                                <div className="mt-4">
                                  <p className="font-medium">Additional Feedback:</p>
                                  <p className="text-sm mt-1 italic">"{watch.feedback}"</p>
                                </div>
                              )}
                            </div>
                          ),
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No responses yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        This user hasn't provided any responses to ad questions yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">User Not Found</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  The user you're looking for doesn't exist or has been deleted.
                </p>
                <Link href="/admin/users">
                  <Button>Back to Users</Button>
                </Link>
              </CardContent>
            </Card>
          )}
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

