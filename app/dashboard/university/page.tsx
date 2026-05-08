// app/dashboard/university/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Building2, GraduationCap, Users, BookOpen, MapPin, Globe, 
  Mail, Phone, Award, Shield, Sparkles, Network, Radio,
  ChevronRight, Loader2, School, Library, Target,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/nav"
import Link from "next/link"

interface UserProfile {
  _id: string
  name: string
  email: string
  role: string
  level?: string
  phone?: string
  address?: string
  university?: {
    _id: string
    name: string
    name_en?: string
    location: string
    country: string
    continent: string
    logo?: string
    email?: string
    phone?: string
    website?: string
  }
  school?: {
    _id: string
    name: string
  }
  mention?: {
    _id: string
    name: string
  }
  filiere?: {
    _id: string
    name: string
    duration: string
    credits: number
  }
}

export default function MyUniversityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      fetchUserData()
    }
  }, [status, router])

  const fetchUserData = async () => {
    try {
      const userId = (session?.user as any)?.id
      const res = await fetch(`/api/users/${userId}`)
      const data = await res.json()
      console.log("📦 User data:", data)
      setUserData(data)
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "instructor": return "Enseignant"
      case "admin": return "Administrateur"
      default: return "Étudiant"
    }
  }

  const getLevelLabel = (level?: string) => {
    switch (level) {
      case "L1": return "Licence 1"
      case "L2": return "Licence 2"
      case "L3": return "Licence 3"
      case "M1": return "Master 1"
      case "M2": return "Master 2"
      case "Doctorat": return "Doctorat"
      default: return level || "Non spécifié"
    }
  }

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

  if (!userData?.university) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white/5 rounded-2xl p-12 border border-cyan-500/30">
              <Building2 className="w-20 h-20 text-cyan-400 mx-auto mb-6 opacity-50" />
              <h1 className="text-2xl font-bold text-white mb-3">Aucune université associée</h1>
              <p className="text-slate-400 mb-6">
                Vous n'êtes actuellement associé à aucune université.
              </p>
              <button
                onClick={() => router.push("/profile")}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl text-white font-medium hover:shadow-lg transition"
              >
                Compléter mon profil
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const university = userData.university

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Mon établissement
                </h1>
              </div>
              <p className="text-slate-400">Visualisez votre affiliation universitaire et votre parcours</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
              <Radio className="h-3 w-3" />
              <span>CONNEXION ACTIVE</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte principale de l'université */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm overflow-hidden">
              {/* Bannière */}
              <div className="h-32 bg-gradient-to-r from-cyan-600/30 to-violet-600/30 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-xl border-4 border-[#0d0d35]">
                    {university.logo ? (
                      <img src={university.logo} alt={university.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Building2 className="h-12 w-12 text-white" />
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="pt-14 pb-6">
                <div className="flex justify-end mb-2">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white border-0">
                    {getRoleLabel(userData.role)}
                  </Badge>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{university.name}</h2>
                {university.name_en && (
                  <p className="text-slate-400 text-sm mb-3">{university.name_en}</p>
                )}
                
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span>{university.location}, {university.country}</span>
                  <span className="text-slate-600">•</span>
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <span>{university.continent}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cyan-500/30">
                  <div className="text-center">
                    <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white text-sm">Étudiants</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white text-sm">Programmes</p>
                  </div>
                  <div className="text-center">
                    <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white text-sm">Écoles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar - Parcours académique */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-cyan-400" />
                  Mon parcours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.school && (
                  <div className="flex items-start gap-3">
                    <School className="h-4 w-4 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">École / Faculté</p>
                      <p className="text-white font-medium">{userData.school.name}</p>
                    </div>
                  </div>
                )}

                {userData.level && (
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Niveau d'étude</p>
                      <p className="text-white font-medium">{getLevelLabel(userData.level)}</p>
                    </div>
                  </div>
                )}

                {userData.mention && (
                  <div className="flex items-start gap-3">
                    <Award className="h-4 w-4 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Mention</p>
                      <p className="text-white font-medium">{userData.mention.name}</p>
                    </div>
                  </div>
                )}

                {userData.filiere && (
                  <div className="flex items-start gap-3">
                    <Library className="h-4 w-4 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Filière / Spécialisation</p>
                      <p className="text-white font-medium">{userData.filiere.name}</p>
                      {userData.filiere.duration && (
                        <p className="text-xs text-slate-400 mt-1">
                          Durée: {userData.filiere.duration} • {userData.filiere.credits} crédits
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations de contact */}
            <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan-400" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-white text-sm">{userData.email}</p>
                  </div>
                </div>
                {userData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-cyan-400" />
                    <div>
                      <p className="text-xs text-slate-400">Téléphone</p>
                      <p className="text-white text-sm">{userData.phone}</p>
                    </div>
                  </div>
                )}
                {userData.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <div>
                      <p className="text-xs text-slate-400">Adresse</p>
                      <p className="text-white text-sm">{userData.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/courses" className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition group">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                    <span className="text-white">Mes cours</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400" />
                </Link>
                <Link href="/dashboard/progress" className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition group">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    <span className="text-white">Ma progression</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}