import { connectToDatabase } from "@/lib/db"
import Quiz from "@/models/Quiz"
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
    const { courseId, title, description, questions, passingScore } = await request.json()

    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.instructor.toString() !== (session.user as any)?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const newQuiz = await Quiz.create({
      course: courseId,
      title,
      description,
      questions,
      passingScore: passingScore || 70,
      order: (course.quizzes?.length || 0) + 1,
    })

    course.quizzes.push(newQuiz._id)
    await course.save()

    return NextResponse.json(newQuiz, { status: 201 })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}
