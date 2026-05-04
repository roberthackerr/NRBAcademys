import { connectToDatabase } from "@/lib/db"
import Lesson from "@/models/Lesson"
import Course from "@/models/Course"
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
    const { courseId, title, description, videoUrl, duration, order, resources } = await request.json()

    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.instructor.toString() !== (session.user as any)?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const newLesson = await Lesson.create({
      course: courseId,
      title,
      description,
      videoUrl,
      duration,
      order,
      resources: resources || [],
    })

    course.lessons.push(newLesson._id)
    await course.save()

    return NextResponse.json(newLesson, { status: 201 })
  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
  }
}
