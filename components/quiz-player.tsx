"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizPlayerProps {
  quizId: string
  title: string
  description?: string
  questions: Question[]
  passingScore: number
  courseId: string
  onComplete?: (score: number, passed: boolean) => void
}

interface QuizResult {
  score: number
  passed: boolean
  detailedAnswers: Array<{
    question: string
    userAnswer: number
    correctAnswer: number
    isCorrect: boolean
    explanation: string
  }>
  passingScore: number
}

export function QuizPlayer({
  quizId,
  title,
  description,
  questions,
  passingScore,
  courseId,
  onComplete,
}: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnswerSelect = (optionIndex: number) => {
    if (submitted) return
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          courseId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setSubmitted(true)
        if (onComplete) {
          onComplete(data.score, data.passed)
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted && result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={result.passed ? "text-green-600" : "text-red-600"}>
            {result.passed ? "Quiz Passed!" : "Quiz Not Passed"}
          </CardTitle>
          <CardDescription>
            Your Score: {result.score}% (Passing Score: {result.passingScore}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {result.detailedAnswers.map((answer, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  answer.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <p className="font-semibold mb-2">
                  Question {idx + 1}: {answer.question}
                </p>
                <div className="mb-2">
                  <p className="text-sm">
                    <span className="font-medium">Your answer:</span>{" "}
                    {answer.userAnswer !== null ? answer.userAnswer + 1 : "Not answered"}
                  </p>
                  {!answer.isCorrect && (
                    <p className="text-sm">
                      <span className="font-medium">Correct answer:</span> {answer.correctAnswer + 1}
                    </p>
                  )}
                </div>
                {answer.explanation && (
                  <p className="text-sm text-gray-700 italic">
                    <span className="font-medium">Explanation:</span> {answer.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <div className="mt-4">
          <div className="flex justify-between mb-2 text-sm">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="font-semibold text-lg mb-4">{question.question}</p>
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                  answers[currentQuestion] === idx
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  checked={answers[currentQuestion] === idx}
                  onChange={() => handleAnswerSelect(idx)}
                  disabled={submitted}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            variant="outline"
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="bg-blue-600 hover:bg-blue-700">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={answers.some((a) => a === null) || loading}
            >
              {loading ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
