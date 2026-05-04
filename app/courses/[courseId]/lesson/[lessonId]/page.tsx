"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { YouTubePlayer } from "@/components/youtube-player"

interface Lesson {
  _id: string
  title: string
  description?: string
  videoUrl: string
  order: number
  duration?: number
  resources?: Array<{ name: string; url: string }>
}

interface Course {
  _id: string
  title: string
  lessons: Lesson[]
  enrolledStudents: string[]
  instructor: { name: string }
}

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchCourseAndLesson()
      checkProgress()
    }
  }, [params.courseId, params.lessonId, status])

  const fetchCourseAndLesson = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}`)
      const data = await response.json()
      setCourse(data)

      const lessonData = data.lessons.find((l: Lesson) => l._id === params.lessonId)
      setLesson(lessonData)
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkProgress = async () => {
    try {
      const response = await fetch(`/api/progress?courseId=${params.courseId}`)
      const data = await response.json()
      setIsCompleted(data.completedLessons?.includes(params.lessonId))
    } catch (error) {
      console.error("Error checking progress:", error)
    }
  }

  const handleMarkComplete = async () => {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.courseId,
          lessonId: params.lessonId,
        }),
      })

      if (response.ok) {
        setIsCompleted(true)
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error)
    }
  }

  const getNextLesson = (): Lesson | null => {
    if (!course || !lesson) return null
    const currentIndex = course.lessons.findIndex((l) => l._id === lesson._id)
    return currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null
  }

  const getPreviousLesson = (): Lesson | null => {
    if (!course || !lesson) return null
    const currentIndex = course.lessons.findIndex((l) => l._id === lesson._id)
    return currentIndex > 0 ? course.lessons[currentIndex - 1] : null
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!course || !lesson) {
    return <div className="p-8">Lesson not found</div>
  }

  const previousLesson = getPreviousLesson()
  const nextLesson = getNextLesson()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/student/dashboard">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">LearnHub</h1>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/courses/${params.courseId}`} className="text-blue-600 hover:underline">
            ← Back to {course.title}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Lesson {lesson.order}: {lesson.title}
                </CardTitle>
                {lesson.description && <CardDescription>{lesson.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <YouTubePlayer videoUrl={lesson.videoUrl} title={lesson.title} />
                </div>

                {lesson.resources && lesson.resources.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold mb-3">Course Resources</p>
                    <div className="space-y-2">
                      {lesson.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <span>📄</span>
                          {resource.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-4">
                  <Button
                    onClick={handleMarkComplete}
                    className={isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                  >
                    {isCompleted ? "✓ Completed" : "Mark as Complete"}
                  </Button>
                </div>

                <div className="mt-6 flex justify-between gap-4">
                  {previousLesson ? (
                    <Link href={`/courses/${params.courseId}/lesson/${previousLesson._id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        ← Previous Lesson
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {nextLesson ? (
                    <Link href={`/courses/${params.courseId}/lesson/${nextLesson._id}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Next Lesson →</Button>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {course.lessons
                    .sort((a, b) => a.order - b.order)
                    .map((l) => (
                      <Link key={l._id} href={`/courses/${params.courseId}/lesson/${l._id}`}>
                        <div
                          className={`p-3 rounded-lg cursor-pointer transition ${
                            l._id === lesson._id
                              ? "bg-blue-100 border border-blue-600"
                              : "border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <p className="text-sm font-semibold">Lesson {l.order}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{l.title}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
