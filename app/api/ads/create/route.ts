import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheAdData } from "@/lib/redis"

export async function POST(req: Request) {
  const { userId } = getAuth(req)

  // In a real app, you'd check if the user is an admin
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, duration, reward, category, difficulty, videoUrl, questions } = await req.json()

    // Validate input
    if (!title || !description || !duration || !reward || !category || !difficulty || !videoUrl || !questions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create ad in database
    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        duration,
        reward,
        category,
        difficulty,
        videoUrl,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            options: q.options,
          })),
        },
      },
      include: {
        questions: true,
      },
    })

    // Invalidate cache
    await cacheAdData("all", null)

    return NextResponse.json({
      success: true,
      ad,
    })
  } catch (error) {
    console.error("Error creating ad:", error)
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 })
  }
}

