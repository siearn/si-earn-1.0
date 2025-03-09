import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { incrementUserBalance } from "@/lib/redis"

export async function POST(req: Request) {
  const { userId } = getAuth(req)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { amount } = await req.json()

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user balance in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: amount },
      },
    })

    // Also update in Redis for faster access
    await incrementUserBalance(user.id, amount)

    return NextResponse.json({
      success: true,
      balance: updatedUser.balance,
    })
  } catch (error) {
    console.error("Error updating user balance:", error)
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
  }
}

