"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  ChevronRight, 
  PlayCircle, 
  MessageCircle,
  CheckCircle,
  Calendar,
  Flame,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  instructor: { name: string; avatar?: string }
  thumbnail?: string
  progress: number
  totalLessons: number
  completedLessons: number
  lastAccessed?: Date
  enrolledAt: Date
}

interface ProgressSummary {
  totalEnrolledCourses: number
  completedCourses: number
  inProgressCourses: number
  averageProgress: number
  totalTimeSpent: {
    minutes: number
    hours: number
    formatted: string
  }
  totalLessonsCompleted: number
  averageQuizScore: number
  currentStreak: number
  longestStreak: number
  certificatesEarned: number
}

interface Activity {
  id: string
  type: string
  courseId: string
  courseTitle: string
  lessonTitle?: string
  details?: string
  timestamp: Date
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      const userRole = (session?.user as any)?.role
      if (userRole === "instructor") {
        router.push("/instructor/dashboard")
      } else if (userRole === "admin") {
        router.push("/admin/dashboard")
      } else {
        fetchDashboardData()
      }
    }
  }, [status, router, session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = (session?.user as any)?.id
      
      if (!userId) {
        throw new Error("Utilisateur non identifié")
      }
      
      const [coursesRes, progressRes, activityRes] = await Promise.all([
        fetch(`/api/users/${userId}/courses`),
        fetch(`/api/users/${userId}/progress`),
        fetch(`/api/users/${userId}/activity?limit=10`)
      ])

      if (!coursesRes.ok) {
        const errorData = await coursesRes.json()
        throw new Error(errorData.error || "Erreur chargement cours")
      }
      if (!progressRes.ok) {
        const errorData = await progressRes.json()
        throw new Error(errorData.error || "Erreur chargement progression")
      }
      if (!activityRes.ok) {
        const errorData = await activityRes.json()
        throw new Error(errorData.error || "Erreur chargement activités")
      }

      const coursesData = await coursesRes.json()
      const progressData = await progressRes.json()
      const activityData = await activityRes.json()

      setCourses(coursesData.courses || [])
      setProgressSummary(progressData.summary)
      setRecentActivity(activityData.activities || [])
    } catch (error) {
      console.error("Error fetching dashboard:", error)
      setError(error instanceof Error ? error.message : "Impossible de charger vos données")
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bonjour"
    if (hour < 18) return "Bon après-midi"
    return "Bonsoir"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_started": return <PlayCircle className="h-4 w-4 text-emerald-500" />
      case "lesson_completed": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "quiz_passed": return <Award className="h-4 w-4 text-amber-500" />
      case "course_completed": return <Award className="h-4 w-4 text-purple-500" />
      default: return <BookOpen className="h-4 w-4 text-slate-500" />
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner": return "Débutant"
      case "intermediate": return "Intermédiaire"
      case "advanced": return "Avancé"
      default: return level || "Standard"
    }
  }

  if (status === "loading" || loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <Card className="max-w-md mx-4 border-0 shadow-xl">
          <CardContent className="pt-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800">Une erreur est survenue</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
      {/* Header avec gradient */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {getGreeting()}, {session?.user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Continuez votre apprentissage</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="relative hover:bg-indigo-100 transition-colors rounded-full">
                  <MessageCircle className="h-5 w-5 text-slate-600" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {progressSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Cours inscrits"
              value={progressSummary.totalEnrolledCourses}
              subtitle={`${progressSummary.completedCourses} complétés`}
              icon={<BookOpen className="h-5 w-5" />}
              gradient="from-indigo-500 to-indigo-600"
            />
            <StatCard
              title="Progression moyenne"
              value={`${progressSummary.averageProgress}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              progress={progressSummary.averageProgress}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              title="Temps d'étude"
              value={progressSummary.totalTimeSpent?.formatted || "0h"}
              subtitle={`${progressSummary.totalLessonsCompleted} leçons`}
              icon={<Clock className="h-5 w-5" />}
              gradient="from-amber-500 to-orange-600"
            />
            <StatCard
              title="Série actuelle"
              value={`${progressSummary.currentStreak || 0} jours`}
              subtitle={`Record: ${progressSummary.longestStreak || 0} jours`}
              icon={<Flame className="h-5 w-5" />}
              gradient="from-rose-500 to-pink-600"
            />
          </div>
        )}

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm border p-1 rounded-xl">
            <TabsTrigger 
              value="courses" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
            >
              Mes Cours
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
            >
              Activité récente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {courses.length === 0 ? (
              <EmptyCoursesState />
            ) : (
              <>
                {/* Continue Learning */}
                {courses.filter(c => c.progress < 100).length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                      <PlayCircle className="h-5 w-5 text-indigo-500" />
                      Continuer l'apprentissage
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.filter(c => c.progress < 100).slice(0, 2).map((course) => (
                        <ContinueCourseCard key={course._id} course={course} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Courses */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Tous mes cours</h2>
                    <Link href="/courses">
                      <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:text-indigo-700">
                        Explorer <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <CourseCard key={course._id} course={course} getLevelLabel={getLevelLabel} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <ActivityFeed activities={recentActivity} getActivityIcon={getActivityIcon} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Composant StatCard
function StatCard({ title, value, subtitle, icon, progress, gradient }: any) {
  // Ensure value is displayed correctly
  const displayValue = typeof value === 'object' ? value?.formatted || value?.hours || "0" : value;
  
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
            {icon}
          </div>
          {progress !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">{progress}%</span>
              <Progress value={progress} className="w-16 h-1.5 bg-slate-100" />
            </div>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          {displayValue}
        </p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

// Composant ContinueCourseCard
function ContinueCourseCard({ course }: { course: Course }) {
  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
      <CardContent className="p-4 relative">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="h-10 w-10 text-white opacity-90" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1 line-clamp-1 text-slate-800 group-hover:text-indigo-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-slate-500 mb-2">{course.instructor?.name || "Instructeur"}</p>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Progression</span>
                <span className="font-medium text-indigo-600">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2 bg-slate-100" />
            </div>
            <Button size="sm" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all" asChild>
              <Link href={`/courses/${course._id}`}>Continuer</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant CourseCard
function CourseCard({ course, getLevelLabel }: { course: Course; getLevelLabel: (level: string) => string }) {
  const isCompleted = course.progress === 100
  
  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-14 w-14 text-white/30 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <Badge className={`absolute top-3 right-3 ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-black/50 backdrop-blur-sm'} border-0`}>
          {isCompleted ? 'Complété' : `${course.progress}%`}
        </Badge>
        {course.level && (
          <Badge className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm border-0">
            {getLevelLabel(course.level)}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-1 line-clamp-1 text-slate-800 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-slate-500 mb-2">{course.instructor?.name || "Instructeur"}</p>
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{course.description}</p>
        <div className="mb-3">
          <Progress value={course.progress} className="h-1.5 bg-slate-100" />
        </div>
        <Button 
          variant={isCompleted ? "outline" : "default"} 
          size="sm" 
          className={`w-full ${!isCompleted && 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg'} transition-all`}
          asChild
        >
          <Link href={`/courses/${course._id}`}>
            {isCompleted ? "Réviser" : "Continuer"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Composant ActivityFeed
function ActivityFeed({ activities, getActivityIcon }: { activities: Activity[]; getActivityIcon: (type: string) => React.ReactNode }) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-16 text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="h-10 w-10 text-indigo-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-slate-800">Aucune activité récente</h3>
          <p className="text-slate-500">Commencez un cours pour voir votre activité</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-slate-800">Activité récente</CardTitle>
        <CardDescription>Votre parcours d'apprentissage</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-indigo-600">{activity.courseTitle}</span>
                {activity.lessonTitle && <span className="text-slate-500"> - {activity.lessonTitle}</span>}
                {activity.details && <span className="text-slate-500"> - {activity.details}</span>}
              </p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Composant EmptyCoursesState
function EmptyCoursesState() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="py-16 text-center">
        <div className="mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-slate-800">Aucun cours inscrit</h3>
        <p className="text-slate-500 mb-6">
          Commencez votre apprentissage en explorant notre catalogue
        </p>
        <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all" asChild>
          <Link href="/courses">Explorer les cours</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Composant DashboardSkeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-48 mb-6 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}