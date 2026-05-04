import { connectToDatabase } from "@/lib/db"
import Progress from "@/models/Progress"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { courseId, lessonId } = await request.json()

    const progress = await Progress.findOne({
      user: (session.user as any)?.id,
      course: courseId,
    })

    if (!progress) {
      return NextResponse.json({ error: "Progress record not found" }, { status: 404 })
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId)
    }

    await progress.save()

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    const progress = await Progress.findOne({
      user: (session.user as any)?.id,
      course: courseId,
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
