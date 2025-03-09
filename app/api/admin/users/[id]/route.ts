import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    const { id } = params

    // Get the user with all their activity
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        adWatches: {
          include: {
            ad: true,
            answers: {
              include: {
                question: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate additional metrics
    const totalEarnings = user.adWatches.reduce((sum, watch) => sum + watch.ad.reward, 0)
    const averageWatchTime =
      user.adWatches.length > 0
        ? user.adWatches.reduce((sum, watch) => sum + watch.watchTime, 0) / user.adWatches.length
        : 0

    // Get activity by day for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activityByDay = await prisma.adWatch.groupBy({
      by: ["createdAt"],
      where: {
        userId: id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
      orderBy: {
        createdAt: "asc",
      },
    })

    // Format the user data
    const formattedUser = {
      ...user,
      metrics: {
        totalEarnings,
        averageWatchTime,
        activityByDay: activityByDay.map((day) => ({
          date: day.createdAt.toISOString().split("T")[0],
          count: day._count,
        })),
      },
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
  }
}

// Add an endpoint to update user admin status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    const { id } = params
    const { isAdmin } = await req.json()

    // Update the user's admin status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

