"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QuizPlayer } from "@/components/quiz-player"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  _id: string
  title: string
  description?: string
  questions: Question[]
  passingScore: number
}

interface Course {
  _id: string
  title: string
}

export default function QuizPage({
  params,
}: {
  params: { courseId: string; quizId: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchQuizAndCourse()
    }
  }, [params.courseId, params.quizId, status])

  const fetchQuizAndCourse = async () => {
    try {
      const quizRes = await fetch(`/api/courses/${params.courseId}`)
      const courseData = await quizRes.json()
      setCourse(courseData)

      const quizData = courseData.quizzes?.find((q: any) => q._id === params.quizId)
      setQuiz(quizData)

      setIsEnrolled(courseData.enrolledStudents?.includes((session?.user as any)?.id))
    } catch (error) {
      console.error("Error fetching quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-blue-600">LearnHub</h1>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-lg text-gray-600 mb-4">You must be enrolled in this course to take the quiz.</p>
              <Link href={`/courses/${params.courseId}`}>
                <Button className="bg-blue-600 hover:bg-blue-700">Go to Course</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!quiz) {
    return <div className="p-8">Quiz not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">LearnHub</h1>
          <Link href={`/courses/${params.courseId}`}>
            <Button variant="outline">Back to Course</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <QuizPlayer
          quizId={params.quizId}
          title={quiz.title}
          description={quiz.description}
          questions={quiz.questions}
          passingScore={quiz.passingScore}
          courseId={params.courseId}
          onComplete={(score, passed) => {
            console.log(`Quiz completed with score: ${score}, Passed: ${passed}`)
          }}
        />
      </main>
    </div>
  )
}
