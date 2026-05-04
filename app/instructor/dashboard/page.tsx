"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  MessageCircle,
  Video,
  FileText,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Star,
  Trophy,
  Brain,
  Sparkles,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Send,
  Eye,
  HelpCircle,
  Flag,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Zap,
  Shield,
  Crown,
  Medal,
  Mail,
  LogOut,
  Menu,
  X,
  Home,
  FileCode,
  UsersRound,
  FolderKanban,
  ChartNoAxesCombined,
  Settings2,
  LifeBuoy,
  ChevronDown,
  CircleDot,
  CreditCard,
  Globe,
  House,
  Briefcase,
  MessageSquare,
  Notebook,
  HomeIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
)

// Types
interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  enrolledStudents: number
  progress: number
  rating: number
  thumbnail: string
  lessons: number
  completedLessons: number
  lastUpdated: Date
}

interface Student {
  _id: string
  name: string
  email: string
  avatar?: string
  progress: number
  lastActive: Date
  grade: number
  attendance: number
  completedAssignments: number
  totalAssignments: number
  quizScore: number
  participation: number
}

interface Assignment {
  _id: string
  title: string
  description: string
  dueDate: Date
  submissions: number
  totalStudents: number
  averageGrade: number
  status: "pending" | "active" | "closed"
}

interface AnalyticsData {
  totalStudents: number
  activeCourses: number
  completionRate: number
  averageGrade: number
  satisfactionScore: number
  weeklyActivity: number[]
  monthlyGrowth: number[]
  topPerformers: Student[]
  atRiskStudents: Student[]
  popularCourses: Course[]
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: number
  subItems?: NavItem[]
}

export default function InstructorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["dashboard", "courses"])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Navigation items
  const navItems: NavItem[] = [
    {
      title: "Tableau de bord",
      href: "#",
      icon: <LayoutDashboard className="h-5 w-5" />,
      subItems: [
        { title: "Aperçu", href: "#overview", icon: <HomeIcon className="h-4 w-4" /> },
        { title: "Analytics", href: "#analytics", icon: <ChartNoAxesCombined className="h-4 w-4" /> },
      ]
    },
    {
      title: "Mes cours",
      href: "#",
      icon: <BookOpen className="h-5 w-5" />,
      badge: courses.length,
      subItems: [
        { title: "Tous les cours", href: "#courses", icon: <FolderKanban className="h-4 w-4" /> },
        { title: "Créer un cours", href: "/instructor/courses/new", icon: <Plus className="h-4 w-4" /> },
        { title: "Catégories", href: "#categories", icon: <Globe className="h-4 w-4" /> },
      ]
    },
    {
      title: "Étudiants",
      href: "#",
      icon: <Users className="h-5 w-5" />,
      badge: analytics?.totalStudents,
      subItems: [
        { title: "Liste des étudiants", href: "#students", icon: <UsersRound className="h-4 w-4" /> },
        { title: "Performances", href: "#performance", icon: <TrendingUp className="h-4 w-4" /> },
        { title: "Messages", href: "/messages", icon: <MessageSquare className="h-4 w-4" /> },
      ]
    },
    {
      title: "Évaluations",
      href: "#",
      icon: <ClipboardList className="h-5 w-5" />,
      subItems: [
        { title: "Devoirs", href: "#assignments", icon: <Notebook className="h-4 w-4" /> },
        { title: "Quiz", href: "#quizzes", icon: <HelpCircle className="h-4 w-4" /> },
        { title: "Notes", href: "#grades", icon: <Award className="h-4 w-4" /> },
      ]
    },
    {
      title: "Calendrier",
      href: "#",
      icon: <CalendarDays className="h-5 w-5" />,
      subItems: [
        { title: "Planning", href: "#schedule", icon: <Calendar className="h-4 w-4" /> },
        { title: "Rendez-vous", href: "#meetings", icon: <Video className="h-4 w-4" /> },
      ]
    },
    {
      title: "Paramètres",
      href: "#",
      icon: <Settings2 className="h-5 w-5" />,
      subItems: [
        { title: "Profil", href: "/profile", icon: <User className="h-4 w-4" /> },
        { title: "Notifications", href: "#notifications", icon: <Bell className="h-4 w-4" /> },
        { title: "Facturation", href: "#billing", icon: <CreditCard className="h-4 w-4" /> },
      ]
    },
  ]

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuTitle)
        ? prev.filter(m => m !== menuTitle)
        : [...prev, menuTitle]
    )
  }

  const handleCreateCourse = () => {
    router.push("/instructor/courses/new")
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      const userRole = (session?.user as any)?.role
      if (userRole !== "instructor") {
        router.push("/student/dashboard")
      } else {
        fetchDashboardData()
      }
    }
  }, [status, router, session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const userId = (session?.user as any)?.id
      
      const [coursesRes, analyticsRes, studentsRes, assignmentsRes] = await Promise.all([
        fetch(`/api/instructor/courses?instructorId=${userId}`),
        fetch(`/api/instructor/analytics?instructorId=${userId}`),
        fetch(`/api/instructor/students?instructorId=${userId}`),
        fetch(`/api/instructor/assignments?instructorId=${userId}`)
      ])

      const coursesData = await coursesRes.json()
      const analyticsData = await analyticsRes.json()
      const studentsData = await studentsRes.json()
      const assignmentsData = await assignmentsRes.json()

      setCourses(coursesData.courses || [])
      setAnalytics(analyticsData)
      setStudents(studentsData.students || [])
      setAssignments(assignmentsData.assignments || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Chart data
  const performanceChartData = {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"],
    datasets: [
      {
        label: "Moyenne classe",
        data: [65, 68, 72, 70, 75, 78, 82, 85],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Top 10%",
        data: [85, 87, 88, 90, 92, 91, 93, 95],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const activityChartData = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    datasets: [
      {
        label: "Activité étudiante",
        data: [120, 145, 132, 168, 189, 95, 78],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 8,
      },
    ],
  }

  const courseDistributionData = {
    labels: ["Informatique", "Mathématiques", "Sciences", "Langues", "Autres"],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { usePointStyle: true, boxWidth: 6 },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-slate-500 font-medium">Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className={cn("transition-all", !isSidebarOpen && "hidden")}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NeuroLearn
            </h1>
            <p className="text-xs text-slate-500">Espace Enseignant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.title}>
            <button
              onClick={() => item.subItems ? toggleMenu(item.title) : null}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50",
                expandedMenus.includes(item.title) && "bg-gradient-to-r from-blue-50 to-purple-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-slate-600">{item.icon}</div>
                <span className={cn("font-medium text-slate-700", !isSidebarOpen && "hidden")}>
                  {item.title}
                </span>
                {item.badge && item.badge > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.subItems && isSidebarOpen && (
                <ChevronDown className={cn(
                  "h-4 w-4 text-slate-400 transition-transform duration-200",
                  expandedMenus.includes(item.title) && "rotate-180"
                )} />
              )}
            </button>
            
            {item.subItems && expandedMenus.includes(item.title) && isSidebarOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.title}
                    href={subItem.href}
                    onClick={() => {
                      if (subItem.href.startsWith("#")) {
                        const tab = subItem.href.slice(1)
                        setActiveTab(tab)
                      }
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    {subItem.icon}
                    <span>{subItem.title}</span>
                    {subItem.badge && subItem.badge > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">
                        {subItem.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
        >
          <LifeBuoy className="h-5 w-5" />
          <span className={cn("text-sm", !isSidebarOpen && "hidden")}>Aide</span>
        </Link>
        <button
          onClick={() => router.push("/api/auth/signout")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className={cn("text-sm", !isSidebarOpen && "hidden")}>Déconnexion</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40", isDarkMode && "dark")}>
      {/* Sidebar Desktop */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r transition-all duration-300",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        isSidebarOpen ? "ml-72" : "ml-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex"
              >
                {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Bon retour, {session?.user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-sm text-slate-500">
                  Voici vos statistiques et activités récentes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="rounded-full"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-96 overflow-y-auto">
                    {[1, 2, 3].map((i) => (
                      <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3">
                        <p className="font-medium text-sm">Nouveau devoir soumis</p>
                        <p className="text-xs text-slate-500">Il y a {i} heure(s)</p>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-blue-600">
                    Voir toutes
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {session?.user?.name?.slice(0, 2).toUpperCase() || "TE"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">
                      {session?.user?.name}
                    </span>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Paramètres</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/api/auth/signout")} className="text-red-600">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatsCard
              title="Étudiants actifs"
              value={analytics?.totalStudents || 0}
              icon={<Users className="h-5 w-5" />}
              gradient="from-blue-500 to-blue-600"
              trend={+12}
            />
            <StatsCard
              title="Cours actifs"
              value={analytics?.activeCourses || 0}
              icon={<BookOpen className="h-5 w-5" />}
              gradient="from-purple-500 to-purple-600"
              trend={+5}
            />
            <StatsCard
              title="Taux de complétion"
              value={`${analytics?.completionRate || 0}%`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              gradient="from-green-500 to-emerald-600"
              trend={+8}
            />
            <StatsCard
              title="Note moyenne"
              value={`${analytics?.averageGrade || 0}%`}
              icon={<Award className="h-5 w-5" />}
              gradient="from-orange-500 to-amber-600"
              trend={+3}
            />
            <StatsCard
              title="Satisfaction"
              value={`${analytics?.satisfactionScore || 0}%`}
              icon={<Star className="h-5 w-5" />}
              gradient="from-pink-500 to-rose-600"
              trend={+2}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Performance académique
                </CardTitle>
                <CardDescription>Évolution des notes sur l'année</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line data={performanceChartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Distribution des cours
                </CardTitle>
                <CardDescription>Répartition par domaine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut data={courseDistributionData} options={{ responsive: true }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Chart */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Activité hebdomadaire
              </CardTitle>
              <CardDescription>Heures d'étude par jour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <Bar data={activityChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Top & At-Risk Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Meilleurs étudiants
                </CardTitle>
                <CardDescription>Les plus performants de vos cours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topPerformers?.slice(0, 5).map((student, index) => (
                    <TopStudentCard key={student._id} student={student} rank={index + 1} />
                  ))}
                  {(!analytics?.topPerformers || analytics.topPerformers.length === 0) && (
                    <p className="text-center text-slate-500 py-8">Aucun étudiant à afficher</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Étudiants à risque
                </CardTitle>
                <CardDescription>Nécessitent une attention particulière</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.atRiskStudents?.slice(0, 5).map((student) => (
                    <AtRiskStudentCard key={student._id} student={student} />
                  ))}
                  {(!analytics?.atRiskStudents || analytics.atRiskStudents.length === 0) && (
                    <p className="text-center text-slate-500 py-8">Aucun étudiant à risque</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Assignments */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                  Devoirs récents
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau devoir
                </Button>
              </div>
              <CardDescription>Prochains devoirs et évaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.slice(0, 5).map((assignment) => (
                  <AssignmentCard key={assignment._id} assignment={assignment} />
                ))}
                {assignments.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Aucun devoir à afficher</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Liste des étudiants
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrer
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <StudentRow key={student._id} student={student} />
                ))}
                {filteredStudents.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Aucun étudiant trouvé</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Create Course Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleCreateCourse}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5" />
              Créer un nouveau cours
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

// Sub-components
function StatsCard({ title, value, icon, gradient, trend }: any) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
            {icon}
          </div>
          {trend && (
            <Badge className="bg-green-100 text-green-700">
              +{trend}%
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </CardContent>
    </Card>
  )
}

function TopStudentCard({ student, rank }: { student: Student; rank: number }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
              {student.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-1 -right-1">
            {rank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
            {rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
            {rank === 3 && <Medal className="h-4 w-4 text-amber-600" />}
          </div>
        </div>
        <div>
          <p className="font-medium text-gray-900">{student.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Moyenne: {student.grade}%</span>
            <span>•</span>
            <span>Présence: {student.attendance}%</span>
          </div>
        </div>
      </div>
      <Badge className="bg-green-100 text-green-700">
        Top {rank}
      </Badge>
    </div>
  )
}

function AtRiskStudentCard({ student }: { student: Student }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={student.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
            {student.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-gray-900">{student.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Progression: {student.progress}%</span>
            <span>•</span>
            <span>Dernière activité: {new Date(student.lastActive).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <Button size="sm" variant="outline" className="gap-1">
        <Mail className="h-3 w-3" />
        Contacter
      </Button>
    </div>
  )
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const isUrgent = new Date(assignment.dueDate) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  const submissionRate = (assignment.submissions / assignment.totalStudents) * 100

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-900">{assignment.title}</h4>
          {isUrgent && (
            <Badge className="bg-red-100 text-red-700 text-xs">Urgent</Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 line-clamp-1">{assignment.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {assignment.submissions}/{assignment.totalStudents} rendus
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            Moyenne: {assignment.averageGrade}%
          </span>
        </div>
        <Progress value={submissionRate} className="h-1 mt-2" />
      </div>
      <Button variant="ghost" size="sm" className="ml-3">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function StudentRow({ student }: { student: Student }) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={student.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            {student.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-gray-900">{student.name}</p>
          <p className="text-xs text-gray-500">{student.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div>
          <p className="text-sm text-gray-500">Progression</p>
          <p className={`font-medium ${getProgressColor(student.progress)}`}>{student.progress}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Moyenne</p>
          <p className="font-medium text-gray-900">{student.grade}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Présence</p>
          <p className="font-medium text-gray-900">{student.attendance}%</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Voir le profil</DropdownMenuItem>
            <DropdownMenuItem>Envoyer un message</DropdownMenuItem>
            <DropdownMenuItem>Consulter les notes</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Signaler</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Import manquant pour User icon
import { User } from "lucide-react"