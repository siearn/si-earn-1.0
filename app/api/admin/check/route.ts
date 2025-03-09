import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function GET(req: Request) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { isAdmin: true },
    })

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 404 })
    }

    return NextResponse.json({ isAdmin: user.isAdmin })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}

