import { connectToDatabase } from "@/lib/db"
import Lesson from "@/models/Lesson"
import Course from "@/models/Course"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const lesson = await Lesson.findById(params.lessonId)

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const course = await Course.findById(lesson.course)
    if (course?.instructor.toString() !== (session.user as any)?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const updateData = await request.json()
    const updatedLesson = await Lesson.findByIdAndUpdate(params.lessonId, updateData, { new: true })

    return NextResponse.json(updatedLesson)
  } catch (error) {
    console.error("Error updating lesson:", error)
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const lesson = await Lesson.findById(params.lessonId)

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const course = await Course.findById(lesson.course)
    if (course?.instructor.toString() !== (session.user as any)?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await Lesson.findByIdAndDelete(params.lessonId)
    await Course.findByIdAndUpdate(lesson.course, {
      $pull: { lessons: params.lessonId },
    })

    return NextResponse.json({ message: "Lesson deleted successfully" })
  } catch (error) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
  }
}
