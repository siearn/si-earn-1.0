import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const { userId } = getAuth(req)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the user is an admin
    const adminCheck = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { isAdmin: true },
    })

    if (!adminCheck || !adminCheck.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get URL parameters for pagination
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: {
        OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }],
      },
    })

    // Get users with pagination and search
    const users = await prisma.user.findMany({
      where: {
        OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }],
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        balance: true,
        adsWatched: true,
        watchTimeMinutes: true,
        feedbackScore: true,
        isAdmin: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { adWatches: true },
        },
      },
    })

    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

