import { connectToDatabase } from "@/lib/db"
import Notification from "@/models/Notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { notificationId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const notification = await Notification.findByIdAndUpdate(params.notificationId, { read: true }, { new: true })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
