// app/admin/universities/[id]/admins/page.tsx - Gestion des administrateurs d'université
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus, Pencil, Trash2, Shield, Mail, Phone, 
  Calendar, Key, RefreshCw, Users, Crown, 
  Sparkles, Network, AlertCircle, Building2, 
  CheckCircle, XCircle, Zap, Clock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Admin {
  id: string
  name: string
  email: string
  phone: string
  role: "super_admin" | "program_admin" | "content_admin" | "viewer"
  status: "active" | "invited" | "suspended"
  invitedBy?: string
  invitedAt?: string
  acceptedAt?: string
  lastActive?: string
}

interface Stats {
  total: number
  superAdmin: number
  programAdmin: number
  contentAdmin: number
  viewer: number
  active: number
  invited: number
}

const roleConfig = {
  super_admin: { 
    label: "Super Admin", 
    description: "Tous les droits",
    color: "from-purple-500 to-pink-500",
    badge: "border-purple-500/30 bg-purple-500/20 text-purple-400"
  },
  program_admin: { 
    label: "Admin Programmes", 
    description: "Gère les filières et cours",
    color: "from-blue-500 to-cyan-500",
    badge: "border-blue-500/30 bg-blue-500/20 text-blue-400"
  },
  content_admin: { 
    label: "Admin Contenu", 
    description: "Gère les ressources",
    color: "from-green-500 to-emerald-500",
    badge: "border-green-500/30 bg-green-500/20 text-green-400"
  },
  viewer: { 
    label: "Consultant", 
    description: "Lecture seule",
    color: "from-gray-500 to-gray-600",
    badge: "border-gray-500/30 bg-gray-500/20 text-gray-400"
  }
}

const statusConfig = {
  active: { 
    label: "Actif", 
    icon: CheckCircle,
    color: "text-green-400",
    badge: "border-green-500/30 bg-green-500/20 text-green-400"
  },
  invited: { 
    label: "Invité", 
    icon: Clock,
    color: "text-yellow-400",
    badge: "border-yellow-500/30 bg-yellow-500/20 text-yellow-400"
  },
  suspended: { 
    label: "Suspendu", 
    icon: XCircle,
    color: "text-red-400",
    badge: "border-red-500/30 bg-red-500/20 text-red-400"
  }
}

// Composant Skeleton
const TableSkeleton = () => (
  <div className="space-y-3 p-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 border-b border-white/10">
        <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 bg-white/5 mb-2" />
          <Skeleton className="h-3 w-48 bg-white/5" />
        </div>
        <Skeleton className="h-6 w-24 bg-white/5" />
        <Skeleton className="h-6 w-20 bg-white/5" />
        <Skeleton className="h-4 w-24 bg-white/5" />
        <Skeleton className="h-8 w-16 bg-white/5" />
      </div>
    ))}
  </div>
)

export default function UniversityAdminsPage() {
  const params = useParams()
  const router = useRouter()
  const universityId = params.id as string

  const [admins, setAdmins] = useState<Admin[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [universityName, setUniversityName] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "program_admin" as Admin["role"]
  })

  // Fetch admins from API
  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/universities/${universityId}/admins`)
      if (!response.ok) throw new Error("Erreur lors du chargement")
      
      const data = await response.json()
      setAdmins(data.admins)
      setStats(data.stats)
      
      // Fetch university name
      const uniResponse = await fetch(`/api/admin/universities/${universityId}`)
      if (uniResponse.ok) {
        const uniData = await uniResponse.json()
        setUniversityName(uniData.name)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Impossible de charger les administrateurs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [universityId])

  const handleInviteAdmin = async () => {
    if (!formData.email || !formData.role) {
      toast.error("Email et rôle sont requis")
      return
    }

    setInviting(true)
    try {
      const response = await fetch(`/api/admin/universities/${universityId}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'invitation")
      }

      toast.success("Invitation envoyée avec succès")
      setDialogOpen(false)
      setFormData({ name: "", email: "", phone: "", role: "program_admin" })
      fetchAdmins()
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "Impossible d'inviter l'administrateur")
    } finally {
      setInviting(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[oklch(0.16_0.04_270)]">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[oklch(0.14_0.05_265)] via-[oklch(0.16_0.04_270)] to-[oklch(0.12_0.06_260)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,255,255,0.08),transparent)]" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.02]" />
      
      {/* Animated Orbs */}
      <div className="fixed top-40 right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-violet-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center flex-wrap gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Gestion des accès</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Administrateurs
                </span>
              </h1>
              <p className="text-gray-400 mt-2">
                {universityName || "Université"} • Gestion des permissions et accès
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/universities/${universityId}`)}
                className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30"
              >
                Retour à l'université
              </Button>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-[0_0_20px_rgba(0,255,255,0.3)]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Inviter un admin
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/15 bg-[oklch(0.21_0.045_270)] backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Total admins</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/10">
                    <Users className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/15 bg-[oklch(0.21_0.045_270)] backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Super Admins</p>
                    <p className="text-3xl font-bold text-purple-400 mt-1">{stats.superAdmin}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Crown className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/15 bg-[oklch(0.21_0.045_270)] backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Actifs</p>
                    <p className="text-3xl font-bold text-green-400 mt-1">{stats.active}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/15 bg-[oklch(0.21_0.045_270)] backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Invitations</p>
                    <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.invited}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-500/10">
                    <Mail className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Admins List */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-cyan-400" />
                Administrateurs
              </CardTitle>
              <CardDescription className="text-gray-400">
                Gérez les administrateurs et leurs permissions sur l'université
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <TableSkeleton />
              ) : admins.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4">
                    <Users className="h-10 w-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Aucun administrateur</h3>
                  <p className="text-gray-400">Invitez votre premier administrateur pour commencer</p>
                  <Button 
                    onClick={() => setDialogOpen(true)}
                    className="mt-4 bg-gradient-to-r from-cyan-500 to-violet-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Inviter un admin
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300 font-medium">Administrateur</TableHead>
                        <TableHead className="text-gray-300 font-medium">Contact</TableHead>
                        <TableHead className="text-gray-300 font-medium">Rôle</TableHead>
                        <TableHead className="text-gray-300 font-medium">Statut</TableHead>
                        <TableHead className="text-gray-300 font-medium">Dernière activité</TableHead>
                        <TableHead className="text-gray-300 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin, index) => (
                        <motion.tr
                          key={admin.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-white/5 hover:bg-white/5 transition-all duration-300 group"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-white/20">
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-400">
                                  {getInitials(admin.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                                  {admin.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-gray-300">
                                <Mail className="h-3 w-3 text-gray-500" />
                                {admin.email}
                              </div>
                              {admin.phone && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Phone className="h-3 w-3" />
                                  {admin.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border", roleConfig[admin.role].badge)}>
                              {roleConfig[admin.role].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border gap-1", statusConfig[admin.status].badge)}>
                              {(() => {
                                const Icon = statusConfig[admin.status].icon
                                return <Icon className="h-3 w-3" />
                              })()}
                              {statusConfig[admin.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {admin.lastActive || "Jamais connecté"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-white/10 text-gray-400 hover:text-cyan-400"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-white/10 text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[oklch(0.21_0.045_270)] border-white/15 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5 text-cyan-400" />
              Inviter un administrateur
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Envoyez une invitation pour rejoindre l'équipe d'administration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nom complet</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Jean RAKOTO"
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jean.rakoto@universite.mg"
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+261 34 12 345 67"
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Rôle *</Label>
              <Select value={formData.role} onValueChange={(v: any) => setFormData({ ...formData, role: v })}>
                <SelectTrigger className="bg-white/5 border-white/15 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[oklch(0.21_0.045_270)] border-white/15">
                  <SelectItem value="super_admin" className="text-white hover:bg-white/10">
                    <div className="flex flex-col">
                      <span>👑 Super Administrateur</span>
                      <span className="text-xs text-gray-400">Tous les droits</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="program_admin" className="text-white hover:bg-white/10">
                    <div className="flex flex-col">
                      <span>📚 Admin Programmes</span>
                      <span className="text-xs text-gray-400">Gère les filières et cours</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="content_admin" className="text-white hover:bg-white/10">
                    <div className="flex flex-col">
                      <span>📝 Admin Contenu</span>
                      <span className="text-xs text-gray-400">Gère les ressources pédagogiques</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer" className="text-white hover:bg-white/10">
                    <div className="flex flex-col">
                      <span>👁️ Consultant</span>
                      <span className="text-xs text-gray-400">Accès lecture seule</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setFormData({ name: "", email: "", phone: "", role: "program_admin" })
              }}
              className="border-white/20 text-gray-300 hover:bg-white/10"
              disabled={inviting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleInviteAdmin}
              disabled={inviting || !formData.email}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400"
            >
              {inviting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer l'invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}