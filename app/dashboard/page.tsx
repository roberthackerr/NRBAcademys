"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Network, Radio, GraduationCap, BookOpen, Award, 
  TrendingUp, Users, Clock, Calendar, ChevronRight,
  Zap, Brain, Target, Sparkles, Activity
} from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    coursesCompleted: 3,
    totalCourses: 8,
    studyHours: 124,
    streakDays: 7,
    averageScore: 85,
    rank: 1245,
    totalStudents: 15234
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 animate-pulse mx-auto mb-4"></div>
          <p className="text-cyan-400/80 font-mono">CHARGEMENT DU DASHBOARD...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
      {/* Grid Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0, 255, 255, 0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
      }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-cyan-500/20 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-cyan-500 to-violet-600 p-2 rounded-xl">
                    <Network className="h-5 w-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  TABLEAU DE BORD
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
                <Radio className="h-3 w-3" />
                <span>CONNEXION ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Bonjour, {session?.user?.name?.split(" ")[0] || "Étudiant"}
            </h1>
            <p className="text-slate-400 mt-1">Bienvenue dans votre espace d'apprentissage personnalisé</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: GraduationCap, label: "Cours complétés", value: `${stats.coursesCompleted}/${stats.totalCourses}`, color: "cyan" },
              { icon: Clock, label: "Heures d'étude", value: `${stats.studyHours}h`, color: "violet" },
              { icon: TrendingUp, label: "Série actuelle", value: `${stats.streakDays} jours`, color: "emerald" },
              { icon: Award, label: "Score moyen", value: `${stats.averageScore}%`, color: "amber" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/5 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono text-cyan-400/70 uppercase">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                      </div>
                      <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 bg-white/5 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-100 flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-400" />
                  Progression académique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Progression globale</span>
                    <span>{(stats.coursesCompleted / stats.totalCourses * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(stats.coursesCompleted / stats.totalCourses * 100)} className="h-2 bg-slate-700" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Objectif du mois</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2 bg-slate-700" />
                </div>
                <div className="pt-4 border-t border-cyan-500/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Classement global</span>
                    <span className="text-cyan-400">#{stats.rank.toLocaleString()} / {stats.totalStudents.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-100 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  Prochain cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <h4 className="font-semibold text-white">Intelligence Artificielle</h4>
                    <p className="text-xs text-slate-400 mt-1">Mercredi 14h00 - Salle A101</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-cyan-400">
                      <Calendar className="h-3 w-3" />
                      <span>Dans 2 jours</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                    Voir l'agenda
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/5 border-cyan-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "Cours complété", name: "Introduction à React", date: "Hier", score: 92 },
                  { action: "Quiz terminé", name: "JavaScript Avancé", date: "Il y a 2 jours", score: 88 },
                  { action: "Nouveau cours commencé", name: "Tailwind CSS", date: "Il y a 3 jours", progress: 25 }
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <div>
                        <p className="text-sm text-white">{activity.action}</p>
                        <p className="text-xs text-slate-400">{activity.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-cyan-400">{activity.date}</p>
                      {activity.score && <p className="text-xs text-slate-500">Score: {activity.score}%</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}