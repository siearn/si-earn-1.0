"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAdmin } from "@/hooks/use-admin"
import UserHeader from "@/components/user-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown } from "lucide-react"

export default function AdminUsersPage() {
  const { isAdmin, loading } = useAdmin()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 10 })
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(true)

  const fetchUsers = async (page = 1, search = "") => {
    setLoadingUsers(true)
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=10&search=${search}`)
      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchUsers(1, searchQuery)
    }
  }, [isAdmin, searchQuery])

  const handlePageChange = (page) => {
    fetchUsers(page, searchQuery)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers(1, searchQuery)
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
          <p className="text-lg font-medium">Loading user management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground">View and manage all users on the platform.</p>
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="w-full md:w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <Button type="submit" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Showing {users.length} of {pagination.total} total users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-muted"></div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">
                            <div className="flex items-center gap-1">
                              Name
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-center">Ads Watched</TableHead>
                          <TableHead className="text-center">Balance</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Joined</TableHead>
                          <TableHead className="text-center">Last Active</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-center">{user.adsWatched}</TableCell>
                            <TableCell className="text-center">${user.balance.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              {user.isAdmin ? (
                                <Badge variant="default" className="bg-primary">
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="outline">User</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">{formatDate(user.createdAt)}</TableCell>
                            <TableCell className="text-center">{formatDate(user.lastActive)}</TableCell>
                            <TableCell className="text-right">
                              <Link href={`/admin/users/${user.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                            disabled={pagination.page === 1}
                          />
                        </PaginationItem>

                        {[...Array(pagination.pages)].map((_, i) => {
                          const page = i + 1
                          // Only show a few pages around the current page
                          if (
                            page === 1 ||
                            page === pagination.pages ||
                            (page >= pagination.page - 1 && page <= pagination.page + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={page === pagination.page}
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                            return <PaginationItem key={page}>...</PaginationItem>
                          }
                          return null
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                            disabled={pagination.page === pagination.pages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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

