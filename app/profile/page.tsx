"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  User,
  Mail,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Edit2,
  Save,
  X,
  Camera,
  Lock,
  Bell,
  Shield,
  LogOut,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Trophy,
  Users,
  Star,
  TrendingUp,
  Network,
  Radio,
  Zap,
  Sparkles,
  Target,
  Diamond,
  Crown,
  Activity,
  Brain,
  Code2,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"

interface UserProfile {
  id: string
  name: string
  email: string
  role: "student" | "instructor" | "admin"
  avatar?: string
  bio?: string
  birthDate?: Date
  address?: string
  phone?: string
  university?: {
    _id: string
    name: string
    location: string
  }
  school?: {
    _id: string
    name: string
  }
  level?: string
  mention?: {
    _id: string
    name: string
  }
  filiere?: {
    _id: string
    name: string
  }
  enrolledCoursesCount: number
  completedCoursesCount: number
  totalHoursSpent: number
  certificatesCount: number
  currentStreak: number
  longestStreak: number
  averageQuizScore: number
  joinedAt: Date
  lastActive: Date
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    phone: "",
    address: ""
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const userId = (session?.user as any)?.id
      const res = await fetch(`/api/users/${userId}/profile`)
      
      if (!res.ok) throw new Error("Erreur lors du chargement du profil")
      
      const data = await res.json()
      setProfile(data)
      setEditForm({
        name: data.name,
        bio: data.bio || "",
        phone: data.phone || "",
        address: data.address || ""
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      showToastMessage("Erreur lors du chargement du profil", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const userId = (session?.user as any)?.id
      const res = await fetch(`/api/users/${userId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })

      if (!res.ok) throw new Error("Erreur lors de la mise à jour")

      await fetchProfile()
      setIsEditing(false)
      showToastMessage("Profil mis à jour avec succès", "success")
      
      await update({ name: editForm.name })
    } catch (error) {
      console.error("Error updating profile:", error)
      showToastMessage("Erreur lors de la mise à jour", "error")
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      showToastMessage("Veuillez sélectionner une image", "error")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToastMessage("L'image ne doit pas dépasser 5MB", "error")
      return
    }

    try {
      setUploadingAvatar(true)
      const formData = new FormData()
      formData.append("avatar", file)
      
      const userId = (session?.user as any)?.id
      const res = await fetch(`/api/users/${userId}/avatar`, {
        method: "POST",
        body: formData
      })

      if (!res.ok) throw new Error("Erreur lors de l'upload")

      await fetchProfile()
      await update()
      showToastMessage("Photo de profil mise à jour", "success")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      showToastMessage("Erreur lors de l'upload", "error")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const showToastMessage = (message: string, type: "success" | "error") => {
    setShowToast({ message, type })
    setTimeout(() => setShowToast(null), 3000)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "instructor":
        return <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">ENSEIGNANT</Badge>
      case "admin":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">ADMINISTRATEUR</Badge>
      default:
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">ÉTUDIANT</Badge>
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
      default: return level
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 animate-pulse mx-auto mb-4"></div>
          <p className="text-cyan-400/80 font-mono">CHARGEMENT DU PROFIL...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] relative overflow-hidden">
      {/* Holographic Grid Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0, 255, 255, 0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
      }} />

      {/* Animated Glow Orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 p-4 rounded-xl backdrop-blur-xl border ${
              showToast.type === "success" 
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/20 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {showToast.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span>{showToast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête du profil */}
        <div className="relative mb-8">
          {/* Bannière de couverture */}
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-cyan-600 via-violet-600 to-purple-600 rounded-2xl -mt-8 opacity-50" />
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-purple-500/20 rounded-2xl -mt-8 blur-xl" />
          
          <div className="relative pt-20 px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar avec upload */}
              <div className="relative group">
                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <Avatar className="h-32 w-32 border-4 border-cyan-500/30 shadow-xl relative">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-violet-600 text-white text-4xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-400" />
                  </div>
                )}
              </div>

              {/* Infos utilisateur */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    {profile.name}
                  </h1>
                  {getRoleBadge(profile.role)}
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-cyan-400" />
                    {profile.email}
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-1">
                      <span>📞</span>
                      {profile.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    Membre depuis {new Date(profile.joinedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                {profile.bio && !isEditing && (
                  <p className="mt-3 text-slate-400 max-w-2xl">{profile.bio}</p>
                )}
              </div>

              {/* Bouton d'édition */}
              <div>
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    variant="outline" 
                    className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    MODIFIER
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                      <Save className="h-4 w-4" />
                      SAUVEGARDER
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 gap-2">
                      <X className="h-4 w-4" />
                      ANNULER
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'édition */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-cyan-100">Modifier mes informations</CardTitle>
                  <CardDescription className="text-slate-400">Mettez à jour vos informations personnelles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-cyan-400">Nom complet</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Votre nom"
                        className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cyan-400">Téléphone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+261 XX XXX XXXX"
                        className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-cyan-400">Bio</Label>
                      <textarea
                        className="w-full min-h-[100px] rounded-md bg-cyan-950/20 border-cyan-500/30 text-cyan-100 px-3 py-2 text-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-cyan-400">Adresse</Label>
                      <Input
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Votre adresse"
                        className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border border-cyan-500/20 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-slate-400">APERÇU</TabsTrigger>
            <TabsTrigger value="academic" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-slate-400">PARCOURS</TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-slate-400">STATISTIQUES</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-slate-400">PARAMÈTRES</TabsTrigger>
          </TabsList>

          {/* Onglet Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Cours suivis"
                value={profile.enrolledCoursesCount}
                icon={<BookOpen className="h-5 w-5" />}
                color="from-cyan-500 to-blue-500"
              />
              <StatCard
                title="Cours complétés"
                value={profile.completedCoursesCount}
                icon={<Award className="h-5 w-5" />}
                color="from-emerald-500 to-teal-500"
              />
              <StatCard
                title="Heures d'étude"
                value={profile.totalHoursSpent}
                icon={<Clock className="h-5 w-5" />}
                color="from-violet-500 to-purple-500"
              />
              <StatCard
                title="Certificats"
                value={profile.certificatesCount}
                icon={<GraduationCap className="h-5 w-5" />}
                color="from-amber-500 to-orange-500"
              />
            </div>

            {/* Série actuelle */}
            <Card className="bg-gradient-to-r from-orange-600 to-red-600 border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 mb-1">Série d'apprentissage</p>
                    <p className="text-3xl font-bold text-white">{profile.currentStreak} jours</p>
                    <p className="text-orange-100 text-sm mt-1">Record: {profile.longestStreak} jours</p>
                  </div>
                  <div className="text-6xl">🔥</div>
                </div>
                <Progress 
                  value={(profile.currentStreak / (profile.longestStreak || 1)) * 100} 
                  className="mt-4 bg-orange-400/30" 
                />
              </CardContent>
            </Card>

            {/* Informations personnelles */}
            <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-100">Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={<Mail className="h-5 w-5 text-cyan-400" />} label="Email" value={profile.email} />
                {profile.phone && <InfoItem icon={<span>📞</span>} label="Téléphone" value={profile.phone} />}
                {profile.address && <InfoItem icon={<MapPin className="h-5 w-5 text-cyan-400" />} label="Adresse" value={profile.address} />}
                <InfoItem icon={<Calendar className="h-5 w-5 text-cyan-400" />} label="Membre depuis" value={new Date(profile.joinedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <InfoItem icon={<Clock className="h-5 w-5 text-cyan-400" />} label="Dernière activité" value={new Date(profile.lastActive).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Parcours académique */}
          <TabsContent value="academic" className="space-y-6">
            <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-100">Parcours académique</CardTitle>
                <CardDescription className="text-slate-400">Vos informations d'étudiant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.university && (
                  <InfoItem icon={<GraduationCap className="h-5 w-5 text-blue-500" />} label="Université" value={profile.university.name} />
                )}
                {profile.school && (
                  <InfoItem icon={<BookOpen className="h-5 w-5 text-purple-500" />} label="École" value={profile.school.name} />
                )}
                {profile.level && (
                  <InfoItem icon={<Award className="h-5 w-5 text-green-500" />} label="Niveau" value={getLevelLabel(profile.level)} />
                )}
                {profile.mention && (
                  <InfoItem icon={<Star className="h-5 w-5 text-yellow-500" />} label="Mention" value={profile.mention.name} />
                )}
                {profile.filiere && (
                  <InfoItem icon={<TrendingUp className="h-5 w-5 text-indigo-500" />} label="Filière" value={profile.filiere.name} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Statistiques */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-cyan-100 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Performances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Moyenne aux quiz</span>
                      <span className="font-medium text-cyan-400">{profile.averageQuizScore}%</span>
                    </div>
                    <Progress value={profile.averageQuizScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Taux de complétion</span>
                      <span className="font-medium text-cyan-400">{profile.enrolledCoursesCount > 0 ? Math.round((profile.completedCoursesCount / profile.enrolledCoursesCount) * 100) : 0}%</span>
                    </div>
                    <Progress value={profile.enrolledCoursesCount > 0 ? (profile.completedCoursesCount / profile.enrolledCoursesCount) * 100 : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-cyan-100 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatRow label="Certificats obtenus" value={profile.certificatesCount} />
                  <StatRow label="Heures totales d'étude" value={`${profile.totalHoursSpent}h`} />
                  <StatRow label="Meilleure série" value={`${profile.longestStreak} jours`} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-100">Préférences de notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingRow label="Notifications par email" description="Recevez des emails sur vos cours" defaultChecked />
                <Separator className="bg-cyan-500/20" />
                <SettingRow label="Rappels de cours" description="Recevez des rappels pour vos cours" defaultChecked />
                <Separator className="bg-cyan-500/20" />
                <SettingRow label="Newsletter" description="Recevez notre newsletter mensuelle" />
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-400">Zone de danger</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => router.push("/api/auth/signout")}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  DÉCONNEXION
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Composants helpers
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm shadow-md hover:shadow-cyan-500/10 transition-all hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 bg-gradient-to-r ${color} rounded-lg text-white`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400 mt-1">{title}</p>
      </CardContent>
    </Card>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5">{icon}</div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="font-medium text-white">{value}</p>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-xl text-cyan-400">{value}</span>
    </div>
  )
}

function SettingRow({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}