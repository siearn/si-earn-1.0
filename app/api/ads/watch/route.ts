import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { incrementUserWatchCount, trackAdAnalytics } from "@/lib/redis"

export async function POST(req: Request) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { adId, watchTime, answers, feedback } = await req.json()

    // Validate input
    if (!adId || typeof watchTime !== "number" || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get ad from database
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
    })

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 })
    }

    // Create ad watch record
    const adWatch = await prisma.adWatch.create({
      data: {
        userId: user.id,
        adId,
        watchTime,
        completed: true,
        feedback: feedback || null,
      },
    })

    // Create answer records
    for (const answer of answers) {
      await prisma.answer.create({
        data: {
          questionId: answer.questionId,
          adWatchId: adWatch.id,
          answer: answer.value,
        },
      })
    }

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: ad.reward },
        adsWatched: { increment: 1 },
        watchTimeMinutes: { increment: Math.ceil(watchTime / 60) },
      },
    })

    // Update Redis for faster access
    await incrementUserWatchCount(user.id)
    await trackAdAnalytics(adId)

    return NextResponse.json({
      success: true,
      reward: ad.reward,
    })
  } catch (error) {
    console.error("Error recording ad watch:", error)
    return NextResponse.json({ error: "Failed to record ad watch" }, { status: 500 })
  }
}

