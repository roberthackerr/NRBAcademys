"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function CreateQuizPage({
  params,
}: {
  params: { courseId: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    passingScore: 70,
  })
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && (session?.user as any)?.role !== "instructor") {
      router.push("/student/dashboard")
    }
  }, [status, router, session])

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ])
  }

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    const newQuestions = [...questions]
    ;(newQuestions[idx] as any)[field] = value
    setQuestions(newQuestions)
  }

  const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[qIdx].options[oIdx] = value
    setQuestions(newQuestions)
  }

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.courseId,
          ...formData,
          questions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create quiz")
      }

      router.push(`/instructor/courses/${params.courseId}/edit`)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">LearnHub</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Quiz</CardTitle>
              <CardDescription>Add a quiz to your course to test student knowledge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

              <div className="space-y-2">
                <label className="text-sm font-medium">Quiz Title</label>
                <Input
                  placeholder="e.g., React Basics Quiz"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Describe what this quiz covers"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Passing Score (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passingScore: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {questions.map((question, qIdx) => (
            <Card key={qIdx}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Question {qIdx + 1}</CardTitle>
                </div>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="text-red-600"
                  >
                    Remove
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Text</label>
                  <textarea
                    placeholder="Enter your question"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIdx, "question", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Answer Options</label>
                  {question.options.map((option, oIdx) => (
                    <div key={oIdx} className="flex gap-2">
                      <Input
                        placeholder={`Option ${oIdx + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                        required
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={question.correctAnswer === oIdx}
                          onChange={() => handleQuestionChange(qIdx, "correctAnswer", oIdx)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Correct</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation</label>
                  <textarea
                    placeholder="Explain the correct answer"
                    value={question.explanation}
                    onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-4">
            <Button type="button" onClick={handleAddQuestion} variant="outline">
              Add Question
            </Button>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
            <Link href={`/instructor/courses/${params.courseId}/edit`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
