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

    // Get total counts
    const totalUsers = await prisma.user.count()
    const totalAds = await prisma.ad.count()
    const totalAdWatches = await prisma.adWatch.count()

    // Calculate total earnings paid out
    const totalEarnings = await prisma.ad.aggregate({
      _sum: {
        reward: true,
      },
    })

    // Get user signups by day for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const userSignupsByDay = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
      orderBy: {
        createdAt: "asc",
      },
    })

    // Get ad watches by day for the last 30 days
    const adWatchesByDay = await prisma.adWatch.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
      orderBy: {
        createdAt: "asc",
      },
    })

    // Get top performing ads
    const topAds = await prisma.ad.findMany({
      take: 5,
      orderBy: {
        adWatches: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: { adWatches: true },
        },
      },
    })

    // Get most active users
    const mostActiveUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        adWatches: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        adsWatched: true,
        _count: {
          select: { adWatches: true },
        },
      },
    })

    return NextResponse.json({
      counts: {
        users: totalUsers,
        ads: totalAds,
        adWatches: totalAdWatches,
        totalEarnings: totalEarnings._sum.reward || 0,
      },
      charts: {
        userSignups: userSignupsByDay.map((day) => ({
          date: day.createdAt.toISOString().split("T")[0],
          count: day._count,
        })),
        adWatches: adWatchesByDay.map((day) => ({
          date: day.createdAt.toISOString().split("T")[0],
          count: day._count,
        })),
      },
      topAds: topAds.map((ad) => ({
        id: ad.id,
        title: ad.title,
        category: ad.category,
        reward: ad.reward,
        watchCount: ad._count.adWatches,
      })),
      mostActiveUsers: mostActiveUsers,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

