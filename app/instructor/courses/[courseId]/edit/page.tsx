"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Lesson {
  _id: string
  title: string
  videoUrl: string
  order: number
  duration?: number
}

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  published: boolean
  lessons: Lesson[]
  instructor: string
  enrolledStudents?: string[]
}

export default function EditCoursePage({
  params,
}: {
  params: { courseId: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [lessonForm, setLessonForm] = useState({
    title: "",
    videoUrl: "",
    duration: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && (session?.user as any)?.role !== "instructor") {
      router.push("/student/dashboard")
    }
  }, [status, router, session])

  useEffect(() => {
    if (status === "authenticated") {
      fetchCourse()
    }
  }, [params.courseId, status])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}`)
      const data = await response.json()
      setCourse(data)
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.courseId,
          ...lessonForm,
          order: (course?.lessons?.length || 0) + 1,
          duration: lessonForm.duration ? Number.parseInt(lessonForm.duration) : undefined,
        }),
      })

      if (response.ok) {
        setLessonForm({ title: "", videoUrl: "", duration: "" })
        setShowLessonForm(false)
        fetchCourse()
      }
    } catch (error) {
      console.error("Error adding lesson:", error)
    }
  }

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}/publish`, { method: "POST" })

      if (response.ok) {
        fetchCourse()
      }
    } catch (error) {
      console.error("Error publishing course:", error)
    }
  }

  const handleNotifyStudents = async () => {
    try {
      if (course?.enrolledStudents && course.enrolledStudents.length > 0) {
        for (const studentId of course.enrolledStudents) {
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: studentId,
              courseId: course._id,
              type: "course_update",
              title: `${course.title} has been updated`,
              message: "Your instructor has made updates to this course.",
              link: `/courses/${course._id}`,
            }),
          })
        }
        alert("Notifications sent to all enrolled students!")
      }
    } catch (error) {
      console.error("Error sending notifications:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!course) {
    return <div className="p-8">Course not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">LearnHub</h1>
          <Link href="/instructor/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.category}</CardDescription>
              </div>
              <Button
                onClick={handlePublish}
                className={course.published ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}
              >
                {course.published ? "Published" : "Publish Course"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="font-semibold capitalize">{course.level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-semibold">${course.price}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lessons ({course?.lessons?.length || 0})</CardTitle>
                <CardDescription>Manage course lessons and videos</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleNotifyStudents} className="bg-green-600 hover:bg-green-700">
                  Notify Students
                </Button>
                <Button onClick={() => setShowLessonForm(!showLessonForm)} className="bg-blue-600 hover:bg-blue-700">
                  {showLessonForm ? "Cancel" : "Add Lesson"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showLessonForm && (
              <form onSubmit={handleAddLesson} className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
                <div>
                  <label className="text-sm font-medium">Lesson Title</label>
                  <Input
                    placeholder="e.g., Introduction to React"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">YouTube Video URL</label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Lesson
                </Button>
              </form>
            )}

            {course.lessons && course.lessons.length > 0 ? (
              <div className="space-y-2">
                {course.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <div key={lesson._id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          Lesson {lesson.order}: {lesson.title}
                        </p>
                        <p className="text-sm text-gray-600">{lesson.videoUrl}</p>
                        {lesson.duration && <p className="text-sm text-gray-600">Duration: {lesson.duration} min</p>}
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">No lessons yet. Add your first lesson to get started.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
