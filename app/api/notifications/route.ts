import { connectToDatabase } from "@/lib/db"
import Notification from "@/models/Notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const query: any = { user: (session.user as any)?.id }
    if (unreadOnly) query.read = false

    const notifications = await Notification.find(query).populate("course", "title").sort({ createdAt: -1 }).limit(50)

    const unreadCount = await Notification.countDocuments({
      user: (session.user as any)?.id,
      read: false,
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { title, message, type, courseId, link } = await request.json()

    const notification = await Notification.create({
      user: (session.user as any)?.id,
      course: courseId,
      type,
      title,
      message,
      link,
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
