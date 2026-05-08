"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { 
  GraduationCap, BookOpen, Users, Award, ChevronRight,
  PlayCircle, Star, ShieldCheck, Sparkles, TrendingUp,
  Clock, Globe, Rocket, Brain, Code2, Briefcase,
  CheckCircle2, ArrowRight, Infinity, Zap, Crown,
  MessageCircle, Video, BarChart3, User, LayoutDashboard,
  Network, Radio, Target, Diamond, Loader2, Building2,
  MapPin, Calendar, Heart, Eye
} from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/nav"
import { toast } from "sonner"

interface Course {
  _id: string
  title: string
  description: string
  duration: number
  price: number
  level: string
  studentsCount: number
  rating?: number
  instructor?: {
    name: string
  }
  thumbnailUrl?: string
  isPublished: boolean
  category?: string
}

interface University {
  _id: string
  name: string
  location: string
  country: string
  continent: string
  logo?: string
  website?: string
  studentsCount: number
  programsCount: number
}

interface Assignment {
  _id: string
  title: string
  description: string
  deadline: string
  course?: {
    title: string
    _id: string
  }
  submitted: boolean
  grade?: number
  status?: "pending" | "submitted" | "graded"
}

interface UserStats {
  enrolledCoursesCount: number
  completedCoursesCount: number
  certificatesCount: number
  totalHoursSpent: number
  currentStreak: number
  averageScore: number
}

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100 + delay * 150)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

const WelcomeSection = ({ userName, stats }: { userName: string; stats: UserStats }) => {
  const progressPercentage = stats.enrolledCoursesCount > 0 
    ? Math.round((stats.completedCoursesCount / stats.enrolledCoursesCount) * 100) 
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl mb-12"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-violet-600 to-purple-600"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="relative p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Bon retour, {userName.split(' ')[0]}!
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stats.enrolledCoursesCount}</p>
                <p className="text-xs text-cyan-200">Cours suivis</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stats.completedCoursesCount}</p>
                <p className="text-xs text-cyan-200">Terminés</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stats.certificatesCount}</p>
                <p className="text-xs text-cyan-200">Certificats</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stats.totalHoursSpent}</p>
                <p className="text-xs text-cyan-200">Heures</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button className="bg-white text-violet-600 hover:bg-cyan-50 shadow-lg hover:shadow-cyan-500/25">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Tableau de bord
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Explorer les cours
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-white">Progression</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-cyan-200 mb-1">
                    <span>Progression globale</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-400 to-violet-400 h-2 rounded-full" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-cyan-200">
                  <span>🔥 Série : {stats.currentStreak} jours</span>
                  <span>⭐ Moyenne : {stats.averageScore}/20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const HeroSection = () => {
  return (
    <div className="text-center relative">
      <Badge variant="secondary" className="mb-6 px-4 py-2 bg-cyan-500/10 border-cyan-500/30 text-cyan-400 backdrop-blur-sm">
        <ShieldCheck className="mr-2 h-4 w-4" />
        +100 000 apprenants nous font confiance
      </Badge>
      
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
        <span className="text-white">Maîtrisez les compétences</span>
        <br />
        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
          du futur
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
        Accédez à des cours de qualité créés par des experts. Apprenez à votre rythme, 
        obtenez des certifications et boostez votre carrière.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <Link href="/signup">
          <Button className="group bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300">
            Commencer gratuitement
            <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/courses">
          <Button variant="outline" className="px-8 py-6 text-lg rounded-xl border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400">
            <PlayCircle className="mr-2 h-5 w-5" />
            Explorer les cours
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [popularCourses, setPopularCourses] = useState<Course[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    enrolledCoursesCount: 0,
    completedCoursesCount: 0,
    certificatesCount: 0,
    totalHoursSpent: 0,
    currentStreak: 0,
    averageScore: 0
  })
  const [globalStats, setGlobalStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalUniversities: 0,
    satisfactionRate: 98
  })
  const [loading, setLoading] = useState(true)

  const isAuthenticated = status === "authenticated"
  const userName = session?.user?.name || "Apprenant"

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // 1. Récupérer les cours populaires
      const coursesRes = await fetch('/api/courses?limit=6&sortBy=popular')
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        const coursesList = coursesData.courses || coursesData.projects || coursesData || []
        setCourses(coursesList.slice(0, 3))
        setPopularCourses(coursesList.slice(0, 6))
        setGlobalStats(prev => ({ ...prev, totalCourses: coursesList.length }))
      }

      // 2. Récupérer les universités
      const uniRes = await fetch('/api/academic-data?type=universities')
      if (uniRes.ok) {
        const uniData = await uniRes.json()
        if (uniData.success) {
          setUniversities(uniData.data.slice(0, 4))
          setGlobalStats(prev => ({ ...prev, totalUniversities: uniData.data.length }))
        }
      }

      // 3. Récupérer les statistiques de l'utilisateur (si connecté)
      if (isAuthenticated) {
        const userId = (session.user as any)?.id
        
        // Cours inscrits
        const enrolledRes = await fetch('/api/student/enrolled-courses')
        if (enrolledRes.ok) {
          const enrolledData = await enrolledRes.json()
          const enrolledCourses = enrolledData.courses || enrolledData || []
          const completedCount = enrolledCourses.filter((c: any) => c.progress === 100).length
          
          setUserStats(prev => ({
            ...prev,
            enrolledCoursesCount: enrolledCourses.length,
            completedCoursesCount: completedCount,
            certificatesCount: completedCount
          }))
        }

        // Statistiques utilisateur
        const statsRes = await fetch(`/api/users/${userId}/statistics`)
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setUserStats(prev => ({
            ...prev,
            totalHoursSpent: statsData.totalHoursSpent || 0,
            currentStreak: statsData.currentStreak || 0,
            averageScore: statsData.averageScore || 0
          }))
        }

        // Devoirs
        const assignmentsRes = await fetch('/api/student/assignments')
        if (assignmentsRes.ok) {
          const assignmentsData = await assignmentsRes.json()
          const assignmentsList = assignmentsData.assignments || assignmentsData || []
          const pendingAssignments = assignmentsList
            .filter((a: any) => !a.submitted && new Date(a.deadline) > new Date())
            .slice(0, 3)
          setAssignments(pendingAssignments)
        }
      }

      // 4. Statistiques globales (si non connecté)
      if (!isAuthenticated) {
        const statsRes = await fetch('/api/stats/global')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setGlobalStats(prev => ({
            ...prev,
            totalStudents: statsData.totalStudents || 2500000,
            satisfactionRate: statsData.satisfactionRate || 98
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { name: "Développement Web", count: 245, icon: <Code2 className="h-6 w-6" />, color: "from-cyan-500 to-blue-500", href: "/courses?category=web" },
    { name: "Intelligence Artificielle", count: 128, icon: <Brain className="h-6 w-6" />, color: "from-violet-500 to-purple-500", href: "/courses?category=ai" },
    { name: "Data Science", count: 189, icon: <BarChart3 className="h-6 w-6" />, color: "from-emerald-500 to-teal-500", href: "/courses?category=data" },
    { name: "Cybersécurité", count: 76, icon: <ShieldCheck className="h-6 w-6" />, color: "from-red-500 to-orange-500", href: "/courses?category=security" },
  ]

  const benefits = [
    { title: "Certification reconnue", description: "Certificats valorisés par les recruteurs", icon: <Award className="h-8 w-8" /> },
    { title: "Apprentissage flexible", description: "Accès 24h/24 à votre rythme", icon: <Clock className="h-8 w-8" /> },
    { title: "Support personnalisé", description: "Assistance dédiée et mentorat", icon: <MessageCircle className="h-8 w-8" /> },
    { title: "Projets pratiques", description: "Portfolio professionnel", icon: <Briefcase className="h-8 w-8" /> },
  ]

  const displayStats = isAuthenticated ? [
    { value: userStats.enrolledCoursesCount, label: "Cours suivis", icon: <BookOpen className="h-5 w-5" />, suffix: "" },
    { value: userStats.completedCoursesCount, label: "Terminés", icon: <Award className="h-5 w-5" />, suffix: "" },
    { value: userStats.certificatesCount, label: "Certificats", icon: <GraduationCap className="h-5 w-5" />, suffix: "" },
    { value: `${userStats.averageScore}/20`, label: "Moyenne", icon: <Star className="h-5 w-5" />, suffix: "" },
  ] : [
    { value: globalStats.totalCourses, label: "Cours disponibles", icon: <BookOpen className="h-5 w-5" />, suffix: "+" },
    { value: 500, label: "Experts formateurs", icon: <Users className="h-5 w-5" />, suffix: "+" },
    { value: globalStats.totalStudents.toLocaleString(), label: "Apprenants", icon: <GraduationCap className="h-5 w-5" />, suffix: "+" },
    { value: globalStats.satisfactionRate, label: "Satisfaction", icon: <TrendingUp className="h-5 w-5" />, suffix: "%" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] relative overflow-hidden">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0, 255, 255, 0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
      }} />
      
      <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <AnimatedSection delay={0}>
          {isAuthenticated ? <WelcomeSection userName={userName} stats={userStats} /> : <HeroSection />}
        </AnimatedSection>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-20">
          {displayStats.map((stat, index) => (
            <AnimatedSection key={stat.label} delay={index + 1}>
              <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-lg inline-flex mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{stat.suffix}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* Courses Section */}
        {courses.length > 0 && (
          <AnimatedSection delay={5}>
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Badge variant="secondary" className="mb-2 px-4 py-1 bg-violet-500/10 text-violet-400 border-violet-500/30">
                    {isAuthenticated ? "RECOMMANDÉ POUR VOUS" : "COURS POPULAIRES"}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {isAuthenticated ? "Cours susceptibles de vous intéresser" : "Formations les plus suivies"}
                  </h2>
                </div>
                <Link href="/courses">
                  <Button variant="ghost" className="group text-cyan-400 hover:text-cyan-300">
                    Voir tout
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Link key={course._id} href={`/courses/${course._id}`}>
                    <Card className="group overflow-hidden border-cyan-500/20 bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl w-fit mb-4">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.studentsCount?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration || 0}h</span>
                          </div>
                          {course.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span>{course.rating}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Categories Section */}
        <AnimatedSection delay={isAuthenticated ? 8 : 5}>
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1 bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
              CATÉGORIES
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explorez nos domaines d'expertise
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Des cours couvrant les technologies et compétences les plus recherchées
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="group cursor-pointer border-cyan-500/20 bg-white/5 backdrop-blur-sm shadow-md hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-gradient-to-br ${category.color} rounded-xl text-white`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-slate-400">{category.count} cours</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </AnimatedSection>

        {/* Universities Section */}
        {universities.length > 0 && (
          <AnimatedSection delay={isAuthenticated ? 8.5 : 5.5}>
            <div className="mt-16">
              <div className="text-center mb-8">
                <Badge variant="secondary" className="mb-4 px-4 py-1 bg-blue-500/10 text-blue-400 border-blue-500/30">
                  UNIVERSITÉS PARTENAIRES
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Rejoignez notre réseau académique
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  {globalStats.totalUniversities}+ universités à travers le monde utilisent notre plateforme
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {universities.map((uni) => (
                  <Link key={uni._id} href={`/universities/${uni._id}`}>
                    <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm text-center p-4 hover:border-cyan-500/50 hover:-translate-y-1 transition-all cursor-pointer group">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {uni.logo ? (
                          <img src={uni.logo} alt={uni.name} className="w-10 h-10 object-contain" />
                        ) : (
                          <Building2 className="h-8 w-8 text-cyan-400" />
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-cyan-400 transition">
                        {uni.name}
                      </h3>
                      <p className="text-slate-400 text-xs flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {uni.location}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Assignments Section (Pour utilisateur connecté) */}
        {isAuthenticated && assignments.length > 0 && (
          <AnimatedSection delay={9}>
            <div className="mt-16">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Badge variant="secondary" className="mb-2 px-4 py-1 bg-amber-500/10 text-amber-400 border-amber-500/30">
                    DEVOIRS À VENIR
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">Travaux à rendre</h2>
                </div>
                <Link href="/student/assignments">
                  <Button variant="ghost" className="group text-cyan-400 hover:text-cyan-300">
                    Voir tout
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assignments.map((assignment) => {
                  const daysLeft = Math.ceil((new Date(assignment.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  const isUrgent = daysLeft <= 3 && daysLeft >= 0
                  
                  return (
                    <Link key={assignment._id} href={`/student/assignments/${assignment._id}`}>
                      <Card className={`border-cyan-500/20 bg-white/5 backdrop-blur-sm hover:border-cyan-500/60 transition-all cursor-pointer ${isUrgent ? 'border-l-4 border-l-red-500' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-white font-semibold line-clamp-1">{assignment.title}</h3>
                            {isUrgent && (
                              <Badge className="bg-red-500/20 text-red-400">Urgent</Badge>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm mb-2 line-clamp-2">{assignment.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-cyan-400">{assignment.course?.title}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-500" />
                              <span className={`${isUrgent ? 'text-red-400' : 'text-slate-500'}`}>
                                {daysLeft === 0 ? "Aujourd'hui" : `${daysLeft}j restants`}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* CTA Section */}
        <AnimatedSection delay={isAuthenticated ? 10 : 7}>
          <div className="mt-24 relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-violet-600 to-purple-600"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative p-8 md:p-12 lg:p-16 text-center">
              <div className="max-w-3xl mx-auto">
                {!isAuthenticated ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-white">Offre limitée</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                      Prêt à commencer votre voyage ?
                    </h2>
                    <p className="text-cyan-100 mb-8 text-lg md:text-xl">
                      Rejoignez plus de {globalStats.totalStudents.toLocaleString()} apprenants
                    </p>
                    <Link href="/signup">
                      <Button className="bg-white text-violet-600 hover:bg-cyan-50 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all">
                        Commencer gratuitement
                        <Sparkles className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                      Continuez votre progression !
                    </h2>
                    <p className="text-cyan-100 mb-8 text-lg md:text-xl">
                      De nouveaux cours vous attendent
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/dashboard">
                        <Button className="bg-white text-violet-600 hover:bg-cyan-50 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all">
                          Accéder au tableau de bord
                          <LayoutDashboard className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/courses">
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                          Explorer les cours
                        </Button>
                      </Link>
                    </div>
                    
                    {userStats.enrolledCoursesCount === 0 && (
                      <div className="mt-6 text-cyan-200 text-sm">
                        Commencez votre premier cours dès maintenant !
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  )
}