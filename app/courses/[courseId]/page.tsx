"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Lesson {
  _id: string
  title: string
  videoUrl: string
  order: number
  duration?: number
  resources?: Array<{ name: string; url: string }>
}

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  instructor: { name: string; bio?: string }
  lessons: Lesson[]
  enrolledStudents: string[]
  createdAt: string
}

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetchCourse()
  }, [params.courseId])

  useEffect(() => {
    if (status === "authenticated" && course) {
      const enrolled = course.enrolledStudents.includes((session?.user as any)?.id)
      setIsEnrolled(enrolled)
    }
  }, [status, course, session])

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

  const handleEnroll = async () => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    setEnrolling(true)
    try {
      const response = await fetch(`/api/courses/${params.courseId}/enroll`, { method: "POST" })

      if (response.ok) {
        setIsEnrolled(true)
        router.push(`/courses/${params.courseId}/lesson/${course?.lessons[0]?._id}`)
      }
    } catch (error) {
      console.error("Error enrolling:", error)
    } finally {
      setEnrolling(false)
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
          <Link href="/courses">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">LearnHub</h1>
          </Link>
          <Link href="/student/dashboard">
            <Button variant="outline">My Courses</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/courses" className="text-blue-600 hover:underline mb-4 block">
            ← Back to Courses
          </Link>
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{course.description}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-semibold">{course.category}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-600">Level</p>
              <p className="font-semibold capitalize">{course.level}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="font-semibold">{course.instructor?.name}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-600">Lessons</p>
              <p className="font-semibold">{course.lessons?.length || 0}</p>
            </div>
          </div>
        </div>

        {isEnrolled ? (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.lessons && course.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {course.lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson) => (
                          <Link key={lesson._id} href={`/courses/${params.courseId}/lesson/${lesson._id}`}>
                            <div className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition">
                              <p className="font-semibold text-blue-600">
                                Lesson {lesson.order}: {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-sm text-gray-600">Duration: {lesson.duration} minutes</p>
                              )}
                            </div>
                          </Link>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No lessons available yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Course Info</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.instructor?.bio && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">About Instructor</p>
                      <p className="text-sm text-gray-600">{course.instructor.bio}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-2">Enrolled Students</p>
                    <p className="text-lg font-semibold text-blue-600">{course.enrolledStudents?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-lg text-gray-600 mb-4">
                Enroll in this course to access all lessons and learning materials.
              </p>
              <Button
                onClick={handleEnroll}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
                disabled={enrolling}
              >
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
