import type { WebhookEvent } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data

    // Create a new user in the database
    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0].email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        balance: 0,
        adsWatched: 0,
        watchTimeMinutes: 0,
        feedbackScore: 100,
      },
    })
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data

    // Update the user in the database
    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: email_addresses[0].email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
      },
    })
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data

    // Delete the user from the database
    await prisma.user.delete({
      where: { clerkId: id },
    })
  }

  return NextResponse.json({ success: true })
}

