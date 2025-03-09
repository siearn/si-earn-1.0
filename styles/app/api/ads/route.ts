import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCachedAdData, cacheAdData } from "@/lib/redis"

export async function GET() {
  try {
    // Try to get ads from cache first
    const cachedAds = await getCachedAdData("all")

    if (cachedAds) {
      return NextResponse.json(cachedAds)
    }

    // If not in cache, get from database
    const ads = await prisma.ad.findMany({
      include: {
        questions: true,
      },
    })

    // Format the ads
    const formattedAds = ads.map((ad) => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      duration: ad.duration,
      reward: ad.reward,
      category: ad.category,
      difficulty: ad.difficulty,
      videoUrl: ad.videoUrl,
      questions: ad.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      })),
    }))

    // Cache the ads
    await cacheAdData("all", formattedAds)

    return NextResponse.json(formattedAds)
  } catch (error) {
    console.error("Error fetching ads:", error)
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 })
  }
}

