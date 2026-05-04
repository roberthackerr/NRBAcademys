import { connectToDatabase } from "@/lib/db"
import Quiz from "@/models/Quiz"
import Progress from "@/models/Progress"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { quizId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { answers, courseId } = await request.json()
    const quiz = await Quiz.findById(params.quizId)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Calculate score
    let correctCount = 0
    const detailedAnswers = quiz.questions.map((q: any, idx: number) => {
      const isCorrect = q.correctAnswer === answers[idx]
      if (isCorrect) correctCount++
      return {
        question: q.question,
        userAnswer: answers[idx],
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      }
    })

    const score = Math.round((correctCount / quiz.questions.length) * 100)
    const passed = score >= quiz.passingScore

    // Update progress
    const progress = await Progress.findOne({
      user: (session.user as any)?.id,
      course: courseId,
    })

    if (progress) {
      const existingQuizScore = progress.quizScores.findIndex((qs: any) => qs.quiz.toString() === params.quizId)

      if (existingQuizScore >= 0) {
        progress.quizScores[existingQuizScore] = {
          quiz: params.quizId,
          score,
          completed: true,
        }
      } else {
        progress.quizScores.push({
          quiz: params.quizId,
          score,
          completed: true,
        })
      }

      await progress.save()
    }

    return NextResponse.json({
      score,
      passed,
      detailedAnswers,
      passingScore: quiz.passingScore,
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
