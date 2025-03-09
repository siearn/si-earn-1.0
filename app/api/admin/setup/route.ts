import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function POST(req: Request) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // This endpoint should only be called once during initial setup
    // Check if any admin users already exist
    const existingAdmins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true },
    })

    if (existingAdmins.length > 0) {
      return NextResponse.json(
        {
          error: "Admin users already exist",
          adminCount: existingAdmins.length,
        },
        { status: 400 },
      )
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, name: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Make the current user an admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
      select: { id: true, name: true, email: true, isAdmin: true },
    })

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error setting up admin user:", error)
    return NextResponse.json({ error: "Failed to set up admin user" }, { status: 500 })
  }
}

