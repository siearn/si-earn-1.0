import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        adWatches: {
          include: {
            ad: true,
            answers: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Format recent activity
    const recentActivity = user.adWatches.map((watch) => ({
      title: watch.ad.title,
      date: watch.createdAt.toLocaleDateString(),
      amount: watch.ad.reward,
    }))

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      adsWatched: user.adsWatched,
      watchTimeMinutes: user.watchTimeMinutes,
      feedbackScore: user.feedbackScore,
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

