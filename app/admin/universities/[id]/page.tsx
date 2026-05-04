// app/admin/universities/[id]/page.tsx - Détails d'une université
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Building2,
  ArrowLeft,
  MapPin,
  Globe,
  Mail,
  Phone,
  Link as LinkIcon,
  Users,
  BookOpen,
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  GraduationCap,
  Network,
  Sparkles,
  Zap,
  Crown,
  TrendingUp,
  Award,
  FileText,
  Settings,
  Save,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface University {
  _id: string
  name: string
  name_en: string
  location: string
  country: string
  continent: string
  website: string
  email: string
  phone: string
  description: string
  address: string
  postalCode: string
  logo?: string
  status: "active" | "pending" | "suspended"
  studentsCount: number
  programsCount: number
  adminCount?: number
  createdAt: string
  updatedAt: string
  stats?: {
    schoolsCount: number
    mentionsCount: number
    filieresCount: number
    adminsCount: number
  }
}

const continents = [
  "Afrique", "Amérique du Nord", "Amérique du Sud", "Asie", "Europe", "Océanie"
]

const statusConfig = {
  active: { label: "Active", icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  pending: { label: "En attente", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  suspended: { label: "Suspendue", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" }
}

export default function UniversityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const universityId = params.id as string

  const [university, setUniversity] = useState<University | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<University>>({})

  // Fetch university details
  const fetchUniversity = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/universities/${universityId}`)
      if (!response.ok) throw new Error("Erreur lors du chargement")
      
      const data = await response.json()
      setUniversity(data)
      setFormData(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Impossible de charger les détails de l'université")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUniversity()
  }, [universityId])

  // Update status
  const handleUpdateStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/admin/universities/${universityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
      
      toast.success(`Statut mis à jour: ${status === "active" ? "Active" : status === "pending" ? "En attente" : "Suspendue"}`)
      fetchUniversity()
    } catch (error) {
      toast.error("Impossible de mettre à jour le statut")
    }
  }

  // Update university
  const handleUpdateUniversity = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/universities/${universityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
      
      toast.success("Université mise à jour avec succès")
      setEditDialogOpen(false)
      fetchUniversity()
    } catch (error) {
      toast.error("Impossible de mettre à jour l'université")
    } finally {
      setSaving(false)
    }
  }

  // Delete university
  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${university?.name}" ? Cette action est irréversible.`)) return
    
    try {
      const response = await fetch(`/api/admin/universities/${universityId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      
      toast.success("Université supprimée avec succès")
      router.push("/admin/universities")
    } catch (error) {
      toast.error("Impossible de supprimer l'université")
    }
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[oklch(0.16_0.04_270)]">
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-32 w-full bg-white/5 rounded-xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
              <Skeleton className="h-96 w-full bg-white/5 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full bg-white/5 rounded-xl" />
              <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-[oklch(0.16_0.04_270)] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Université non trouvée</h2>
          <p className="text-gray-400 mb-4">L'université que vous recherchez n'existe pas ou a été supprimée</p>
          <Button onClick={() => router.push("/admin/universities")} className="bg-gradient-to-r from-cyan-500 to-violet-500">
            Retour aux universités
          </Button>
        </div>
      </div>
    )
  }

  const status = statusConfig[university.status]

  return (
    <div className="min-h-screen relative overflow-hidden bg-[oklch(0.16_0.04_270)]">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[oklch(0.14_0.05_265)] via-[oklch(0.16_0.04_270)] to-[oklch(0.12_0.06_260)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,255,255,0.08),transparent)]" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.02]" />
      
      {/* Animated Orbs */}
      <div className="fixed top-40 right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-violet-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/universities")}
            className="mb-4 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux universités
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-cyan-500/10 border border-white/10 mb-8"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-full blur-3xl" />
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex gap-6 items-center">
                {/* Logo */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/20 flex items-center justify-center overflow-hidden">
                  {university.logo ? (
                    <img src={university.logo} alt={university.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="h-12 w-12 text-cyan-400" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{university.name}</h1>
                    <Badge className={cn("border gap-1.5 px-3 py-1", status.bg, status.border, status.color)}>
                      <status.icon className="h-3.5 w-3.5" />
                      {status.label}
                    </Badge>
                  </div>
                  {university.name_en && (
                    <p className="text-gray-400 text-lg mb-2">{university.name_en}</p>
                  )}
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span>{university.location}, {university.country}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <Globe className="h-4 w-4 text-cyan-400" />
                    <span>{university.continent}</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(true)}
                  className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Étudiants</p>
                      <p className="text-2xl font-bold text-white">{university.studentsCount?.toLocaleString() || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-cyan-400/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Programmes</p>
                      <p className="text-2xl font-bold text-white">{university.programsCount || 0}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-violet-400/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Administrateurs</p>
                      <p className="text-2xl font-bold text-white">{university.adminCount || 0}</p>
                    </div>
                    <Shield className="h-8 w-8 text-purple-400/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Écoles</p>
                      <p className="text-2xl font-bold text-white">{university.stats?.schoolsCount || 0}</p>
                    </div>
                    <GraduationCap className="h-8 w-8 text-emerald-400/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    {university.description || "Aucune description disponible pour le moment."}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Structure Académique */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Network className="h-5 w-5 text-cyan-400" />
                    Structure académique
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Aperçu de l'offre de formation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-3xl font-bold text-cyan-400">{university.stats?.schoolsCount || 0}</div>
                      <div className="text-sm text-gray-400 mt-1">Écoles</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-3xl font-bold text-violet-400">{university.stats?.mentionsCount || 0}</div>
                      <div className="text-sm text-gray-400 mt-1">Mentions</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-3xl font-bold text-purple-400">{university.stats?.filieresCount || 0}</div>
                      <div className="text-sm text-gray-400 mt-1">Filières</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <Button
                      onClick={() => router.push(`/admin/universities/${universityId}/programs`)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Gérer les programmes
                    </Button>
                    <Button
                      onClick={() => router.push(`/admin/universities/${universityId}/admins`)}
                      variant="outline"
                      className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Gérer les admins
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            {/* Status Actions */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.15 }}
            >
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-cyan-400" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {university.status !== "active" && (
                    <Button
                      onClick={() => handleUpdateStatus("active")}
                      className="w-full bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Activer l'université
                    </Button>
                  )}
                  {university.status !== "suspended" && (
                    <Button
                      onClick={() => handleUpdateStatus("suspended")}
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Suspendre l'université
                    </Button>
                  )}
                  {university.status !== "pending" && (
                    <Button
                      onClick={() => handleUpdateStatus("pending")}
                      variant="outline"
                      className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Mettre en attente
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Mail className="h-5 w-5 text-cyan-400" />
                    Coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {university.email && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <Mail className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email officiel</p>
                        <a href={`mailto:${university.email}`} className="text-white hover:text-cyan-400 transition-colors">
                          {university.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {university.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/10">
                        <Phone className="h-4 w-4 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Téléphone</p>
                        <a href={`tel:${university.phone}`} className="text-white hover:text-cyan-400 transition-colors">
                          {university.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {university.website && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <LinkIcon className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Site web</p>
                        <a href={`https://${university.website}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-cyan-400 transition-colors">
                          {university.website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Address */}
            {(university.address || university.postalCode) && (
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.25 }}
              >
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <MapPin className="h-5 w-5 text-cyan-400" />
                      Adresse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">
                      {university.address}
                      {university.postalCode && <span className="block text-gray-400 text-sm mt-1">Code postal: {university.postalCode}</span>}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Meta Information */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    Informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Créée le</span>
                    <span className="text-white">{new Date(university.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Dernière modification</span>
                    <span className="text-white">{new Date(university.updatedAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">ID Université</span>
                    <span className="text-cyan-400 font-mono text-xs">{university._id.slice(-8)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[oklch(0.21_0.045_270)] border-white/15 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="h-5 w-5 text-cyan-400" />
              Modifier l'université
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les informations de l'université
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nom (Français) *</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/15 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Nom (Anglais)</Label>
                <Input
                  value={formData.name_en || ""}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="bg-white/5 border-white/15 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Ville</Label>
                <Input
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-white/5 border-white/15 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Pays</Label>
                <Input
                  value={formData.country || ""}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="bg-white/5 border-white/15 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Continent</Label>
                <Select value={formData.continent} onValueChange={(v) => setFormData({ ...formData, continent: v })}>
                  <SelectTrigger className="bg-white/5 border-white/15 text-white">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent className="bg-[oklch(0.21_0.045_270)] border-white/15">
                    {continents.map(c => (
                      <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Code postal</Label>
                <Input
                  value={formData.postalCode || ""}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="bg-white/5 border-white/15 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Adresse</Label>
              <Input
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-white/5 border-white/15 text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/15 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Téléphone</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/15 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Site web</Label>
              <Input
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-white/5 border-white/15 text-white"
                placeholder="www.exemple.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="bg-white/5 border-white/15 text-white resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdateUniversity}
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-violet-500"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}