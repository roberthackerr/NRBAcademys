// app/admin/universities/page.tsx - Liste des universités (Admin Global)
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Building2, Plus, Search, Edit, Trash2, Users, 
  BookOpen, Globe, MapPin, ChevronRight, Shield, 
  GraduationCap, MoreVertical, CheckCircle, XCircle,
  TrendingUp, Sparkles, Zap, Network, Crown
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Types
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
  logo?: string
  status: "active" | "pending" | "suspended"
  studentsCount: number
  programsCount: number
  adminCount?: number
  createdAt: string
  description?: string
  address?: string
  postalCode?: string
}

interface Stats {
  total: number
  active: number
  pending: number
  suspended: number
  totalStudents: number
  totalPrograms: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

// Composant Skeleton pour le loading
const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-white/10">
        <Skeleton className="h-12 w-48 bg-white/5" />
        <Skeleton className="h-12 w-32 bg-white/5" />
        <Skeleton className="h-12 w-24 bg-white/5" />
        <Skeleton className="h-12 w-20 bg-white/5" />
        <Skeleton className="h-12 w-20 bg-white/5" />
        <Skeleton className="h-12 w-20 bg-white/5" />
        <Skeleton className="h-12 w-10 bg-white/5" />
      </div>
    ))}
  </div>
)

// Badge de statut avec effets néon
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    active: {
      label: "Active",
      icon: CheckCircle,
      className: "border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]",
    },
    pending: {
      label: "En attente",
      icon: Zap,
      className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]",
    },
    suspended: {
      label: "Suspendue",
      icon: XCircle,
      className: "border-red-500/30 bg-red-500/10 text-red-400",
    },
  }
  
  const { label, icon: Icon, className } = config[status as keyof typeof config] || config.pending
  
  return (
    <Badge className={cn("border backdrop-blur-sm px-3 py-1 gap-1.5 font-medium", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

// Carte de statistique avec effet néon
// Carte de statistique avec effet néon - CORRIGÉE
const StatCard = ({ title, value, icon: Icon, gradient, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-[oklch(0.21_0.045_270)] to-[oklch(0.18_0.04_270)] backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-500 group shadow-xl">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">{title}</p>
            <motion.p 
              className={cn("text-4xl font-bold mt-2 bg-gradient-to-r bg-clip-text text-transparent", gradient)}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring" }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </motion.p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Icon className="h-10 w-10 text-cyan-400/60 group-hover:text-cyan-400 transition-all duration-300" />
          </div>
        </div>
      </CardContent>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </Card>
  </motion.div>
)

export default function AdminUniversitiesPage() {
  const router = useRouter()
  const [universities, setUniversities] = useState<University[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [continentFilter, setContinentFilter] = useState("all")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch universities from API
  const fetchUniversities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(continentFilter !== "all" && { continent: continentFilter }),
        ...(debouncedSearch && { search: debouncedSearch }),
      })
      
      const response = await fetch(`/api/admin/universities?${params}`)
      if (!response.ok) throw new Error("Erreur lors du chargement")
      
      const data = await response.json()
      setUniversities(data.universities)
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Impossible de charger les universités")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUniversities()
  }, [statusFilter, continentFilter, debouncedSearch])

  // Delete university handler
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ? Cette action est irréversible.`)) return
    
    try {
      const response = await fetch(`/api/admin/universities/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      
      toast.success(`"${name}" a été supprimée`)
      fetchUniversities()
    } catch (error) {
      toast.error("Impossible de supprimer l'université")
    }
  }

  // Update status handler
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/universities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
      
      toast.success(`Statut mis à jour avec succès`)
      fetchUniversities()
    } catch (error) {
      toast.error("Impossible de mettre à jour le statut")
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[oklch(0.16_0.04_270)] via-[oklch(0.18_0.04_275)] to-[oklch(0.14_0.05_265)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,255,255,0.05),transparent)]" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.02]" />
      
      {/* Animated Glow Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-violet-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Floating Nodes */}
      <div className="fixed top-1/3 left-10 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan] animate-float" />
      <div className="fixed bottom-1/4 right-10 w-1.5 h-1.5 bg-violet-400 rounded-full shadow-[0_0_8px_violet] animate-float delay-700" />
      <div className="fixed top-2/3 right-1/3 w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_6px_cyan] animate-float delay-300" />

      {/* Header Hero */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center flex-wrap gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
                <Crown className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Administration Globale</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  GlobeUni Network
                </span>
              </h1>
              <p className="text-gray-400 mt-4 text-lg max-w-2xl">
                Gérez l'ensemble des universités partenaires, leurs administrateurs et programmes académiques depuis un hub centralisé.
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/admin/universities/add">
                <Button className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white border-0 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300 px-6 py-6 text-base gap-2">
                  <Plus className="h-5 w-5" />
                  Nouvelle université
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <StatCard 
              title="Total universités" 
              value={stats.total} 
              icon={Building2}
              gradient="from-cyan-400 to-cyan-600"
              delay={0}
            />
            <StatCard 
              title="Étudiants actifs" 
              value={stats.totalStudents} 
              icon={Users}
              gradient="from-violet-400 to-violet-600"
              delay={0.1}
            />
            <StatCard 
              title="Programmes" 
              value={stats.totalPrograms} 
              icon={BookOpen}
              gradient="from-cyan-400 to-violet-400"
              delay={0.2}
            />
            <StatCard 
              title="En attente" 
              value={stats.pending} 
              icon={Zap}
              gradient="from-yellow-400 to-yellow-600"
              delay={0.3}
            />
          </motion.div>
        )}

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8 border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, pays ou localisation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Tous", color: "default" },
                    { value: "active", label: "Actives", color: "green" },
                    { value: "pending", label: "En attente", color: "yellow" },
                    { value: "suspended", label: "Suspendues", color: "red" },
                  ].map((filter) => (
  <Button
    key={filter.value}
    variant={statusFilter === filter.value ? "default" : "outline"}
    onClick={() => setStatusFilter(filter.value)}
    className={cn(
      "transition-all duration-300 font-medium",
      statusFilter === filter.value
        ? filter.color === "green" 
          ? "bg-green-500 hover:bg-green-600 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
          : filter.color === "yellow" 
          ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          : filter.color === "red" 
          ? "bg-red-500 hover:bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          : "bg-gradient-to-r from-cyan-500 to-violet-500 text-white border-transparent shadow-[0_0_15px_rgba(0,255,255,0.3)]"
        : "border-white/20 text-gray-300 bg-white/5 hover:bg-white/15 hover:border-cyan-400/50 hover:text-white"
    )}
  >
    {filter.label}
  </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Universities Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <TableSkeleton />
              ) : universities.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4">
                    <Building2 className="h-10 w-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Aucune université trouvée</h3>
                  <p className="text-gray-400">Aucune université ne correspond à vos critères de recherche.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300 font-medium">Université</TableHead>
                        <TableHead className="text-gray-300 font-medium">Localisation</TableHead>
                        <TableHead className="text-gray-300 font-medium">Statut</TableHead>
                        <TableHead className="text-gray-300 font-medium text-right">Étudiants</TableHead>
                        <TableHead className="text-gray-300 font-medium text-right">Programmes</TableHead>
                        <TableHead className="text-gray-300 font-medium text-right">Admins</TableHead>
                        <TableHead className="text-gray-300 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="wait">
                        {universities.map((uni, index) => (
                          <motion.tr
                            key={uni._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-white/5 hover:bg-white/5 transition-all duration-300 group cursor-pointer"
                            onClick={() => router.push(`/admin/universities/${uni._id}`)}
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                                  {uni.logo ? (
                                    <img src={uni.logo} alt={uni.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Building2 className="h-5 w-5 text-cyan-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                                    {uni.name}
                                  </div>
                                  <div className="text-sm text-gray-500">{uni.name_en}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-300">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                <span>{uni.location}, {uni.country}</span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {uni.continent}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={uni.status} />
                            </TableCell>
                            <TableCell className="text-right font-mono text-white">
                              {uni.studentsCount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-cyan-400">
                              {uni.programsCount}
                            </TableCell>
                            <TableCell className="text-right font-mono text-violet-400">
                              {uni.adminCount || 0}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="hover:bg-white/10">
                                    <MoreVertical className="h-4 w-4 text-gray-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[oklch(0.21_0.045_270)] border-white/10 backdrop-blur-xl">
                                  <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    onClick={() => router.push(`/admin/universities/${uni._id}`)}
                                    className="text-white hover:bg-white/10 cursor-pointer gap-2"
                                  >
                                    <GraduationCap className="h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => router.push(`/admin/universities/${uni._id}/programs`)}
                                    className="text-white hover:bg-white/10 cursor-pointer gap-2"
                                  >
                                    <BookOpen className="h-4 w-4" />
                                    Programmes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => router.push(`/admin/universities/${uni._id}/admins`)}
                                    className="text-white hover:bg-white/10 cursor-pointer gap-2"
                                  >
                                    <Users className="h-4 w-4" />
                                    Administrateurs
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  {uni.status !== "active" && (
                                    <DropdownMenuItem 
                                      onClick={() => handleUpdateStatus(uni._id, "active")}
                                      className="text-green-400 hover:bg-white/10 cursor-pointer gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Activer
                                    </DropdownMenuItem>
                                  )}
                                  {uni.status !== "suspended" && (
                                    <DropdownMenuItem 
                                      onClick={() => handleUpdateStatus(uni._id, "suspended")}
                                      className="text-red-400 hover:bg-white/10 cursor-pointer gap-2"
                                    >
                                      <XCircle className="h-4 w-4" />
                                      Suspendre
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(uni._id, uni.name)}
                                    className="text-red-400 hover:bg-red-500/10 cursor-pointer gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-white/10">
                  <p className="text-sm text-gray-500">
                    Affichage de {(pagination.page - 1) * pagination.limit + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} universités
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => {/* Implement pagination */}}
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      Précédent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => {/* Implement pagination */}}
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}