// app/admin/universities/[id]/programs/page.tsx - Gestion des programmes (Version CORRIGÉE)
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Plus, Pencil, Trash2, School, BookOpen, 
  Layers, ChevronRight, Save, X, GraduationCap,
  Building2, Sparkles, Network, AlertCircle, 
  CheckCircle, Zap, Clock, TrendingUp
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Types basés sur vos modèles
interface School {
  _id: string
  name: string
  description: string
  university: string
}

interface Mention {
  _id: string
  name: string
  description: string
  school: {
    _id: string
    name: string
  }
}

interface Filiere {
  _id: string
  name: string
  description: string
  duration: string
  credits: number
  level: string
  mention: {
    _id: string
    name: string
  }
}

const levels = [
  "Licence 1", "Licence 2", "Licence 3", 
  "Master 1", "Master 2", "Doctorat", 
  "Bachelor 1", "Bachelor 2", "Bachelor 3"
]

// Composant Skeleton
const TabSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48 bg-white/5" />
      <Skeleton className="h-10 w-40 bg-white/5" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />
      ))}
    </div>
  </div>
)

export default function UniversityProgramsPage() {
  const params = useParams()
  const router = useRouter()
  const universityId = params.id as string

  const [activeTab, setActiveTab] = useState("schools")
  const [loading, setLoading] = useState(true)
  const [universityName, setUniversityName] = useState("")
  
  // Data states
  const [schools, setSchools] = useState<School[]>([])
  const [mentions, setMentions] = useState<Mention[]>([])
  const [filieres, setFilieres] = useState<Filiere[]>([])
  
  // Dialog states
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false)
  const [mentionDialogOpen, setMentionDialogOpen] = useState(false)
  const [filiereDialogOpen, setFiliereDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [schoolForm, setSchoolForm] = useState({ name: "", description: "" })
  const [mentionForm, setMentionForm] = useState({ name: "", description: "", schoolId: "" })
  const [filiereForm, setFiliereForm] = useState({ 
    name: "", description: "", duration: "", credits: 0, mentionId: "", level: "" 
  })

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch university name
      const uniResponse = await fetch(`/api/admin/universities/${universityId}`)
      if (uniResponse.ok) {
        const uniData = await uniResponse.json()
        setUniversityName(uniData.name)
      }

      // Fetch schools
      const schoolsRes = await fetch(`/api/admin/universities/${universityId}/schools`)
      if (schoolsRes.ok) {
        const schoolsData = await schoolsRes.json()
        setSchools(schoolsData)
      }

      // Fetch mentions
      const mentionsRes = await fetch(`/api/admin/universities/${universityId}/mentions`)
      if (mentionsRes.ok) {
        const mentionsData = await mentionsRes.json()
        setMentions(mentionsData)
      }

      // Fetch filieres
      const filieresRes = await fetch(`/api/admin/universities/${universityId}/filieres`)
      if (filieresRes.ok) {
        const filieresData = await filieresRes.json()
        setFilieres(filieresData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Impossible de charger les données")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [universityId])

  // School CRUD
  const handleSaveSchool = async () => {
    if (!schoolForm.name) {
      toast.error("Le nom de l'école est requis")
      return
    }

    setSubmitting(true)
    try {
      const url = editingItem 
        ? `/api/admin/universities/${universityId}/schools/${editingItem._id}`
        : `/api/admin/universities/${universityId}/schools`
      
      const method = editingItem ? "PATCH" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schoolForm),
      })

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement")

      toast.success(editingItem ? "École modifiée" : "École créée")
      setSchoolDialogOpen(false)
      setSchoolForm({ name: "", description: "" })
      setEditingItem(null)
      fetchData()
    } catch (error) {
      toast.error("Impossible d'enregistrer l'école")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSchool = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ? Toutes les mentions et filières associées seront supprimées.`)) return
    
    try {
      const response = await fetch(`/api/admin/universities/${universityId}/schools/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      
      toast.success(`"${name}" a été supprimée`)
      fetchData()
    } catch (error) {
      toast.error("Impossible de supprimer l'école")
    }
  }

  // Mention CRUD
  const handleSaveMention = async () => {
    if (!mentionForm.name || !mentionForm.schoolId) {
      toast.error("Le nom et l'école sont requis")
      return
    }

    setSubmitting(true)
    try {
      const url = `/api/admin/universities/${universityId}/mentions`
      const method = "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mentionForm.name,
          description: mentionForm.description,
          schoolId: mentionForm.schoolId,
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement")

      toast.success("Mention créée")
      setMentionDialogOpen(false)
      setMentionForm({ name: "", description: "", schoolId: "" })
      fetchData()
    } catch (error) {
      toast.error("Impossible d'enregistrer la mention")
    } finally {
      setSubmitting(false)
    }
  }

  // Filiere CRUD
  const handleSaveFiliere = async () => {
    if (!filiereForm.name || !filiereForm.mentionId || !filiereForm.level) {
      toast.error("Le nom, la mention et le niveau sont requis")
      return
    }

    setSubmitting(true)
    try {
      const url = `/api/admin/universities/${universityId}/filieres`
      const method = "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: filiereForm.name,
          description: filiereForm.description,
          duration: filiereForm.duration,
          credits: filiereForm.credits,
          level: filiereForm.level,
          mentionId: filiereForm.mentionId,
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement")

      toast.success("Filière créée")
      setFiliereDialogOpen(false)
      setFiliereForm({ name: "", description: "", duration: "", credits: 0, mentionId: "", level: "" })
      fetchData()
    } catch (error) {
      toast.error("Impossible d'enregistrer la filière")
    } finally {
      setSubmitting(false)
    }
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
                <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Catalogue académique</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Programmes
                </span>
              </h1>
              <p className="text-gray-400 mt-2">
                {universityName || "Université"} • Gérez l'offre de formation
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/universities/${universityId}`)}
              className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30"
            >
              Retour à l'université
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/5 border border-white/10 rounded-lg p-1">
            <TabsTrigger 
              value="schools" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-cyan-400"
            >
              <School className="h-4 w-4" />
              Écoles
            </TabsTrigger>
            <TabsTrigger 
              value="mentions" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-cyan-400"
            >
              <BookOpen className="h-4 w-4" />
              Mentions
            </TabsTrigger>
            <TabsTrigger 
              value="filieres" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-cyan-400"
            >
              <Layers className="h-4 w-4" />
              Filières
            </TabsTrigger>
          </TabsList>

          {/* Schools Tab */}
          <TabsContent value="schools" className="space-y-4">
            {loading ? (
              <TabSkeleton />
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Écoles et instituts</h2>
                  <Button
                    onClick={() => {
                      setEditingItem(null)
                      setSchoolForm({ name: "", description: "" })
                      setSchoolDialogOpen(true)
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une école
                  </Button>
                </div>

                {schools.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                    <School className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Aucune école</h3>
                    <p className="text-gray-400">Créez votre première école ou institut</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="wait">
                      {schools.map((school, index) => (
                        <motion.div
                          key={school._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 group">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">
                                  {school.name}
                                </CardTitle>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingItem(school)
                                      setSchoolForm({ name: school.name, description: school.description || "" })
                                      setSchoolDialogOpen(true)
                                    }}
                                    className="hover:bg-white/10 text-gray-400 hover:text-cyan-400"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSchool(school._id, school.name)}
                                    className="hover:bg-white/10 text-gray-400 hover:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <CardDescription className="text-gray-400">
                                {school.description || "Aucune description"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex gap-2">
                                <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                                  {mentions.filter(m => m.school._id === school._id).length} mentions
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Mentions Tab - CORRIGÉ */}
          <TabsContent value="mentions" className="space-y-4">
            {loading ? (
              <TabSkeleton />
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Mentions</h2>
                  <Button
                    onClick={() => {
                      setEditingItem(null)
                      setMentionForm({ name: "", description: "", schoolId: "" })
                      setMentionDialogOpen(true)
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une mention
                  </Button>
                </div>

                {schools.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                    <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Créez d'abord une école</h3>
                    <p className="text-gray-400">Les mentions sont rattachées à une école</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {schools.map(school => {
                      const schoolMentions = mentions.filter(m => m.school._id === school._id)
                      if (schoolMentions.length === 0) return null
                      
                      return (
                        <div key={school._id} className="space-y-3">
                          <h3 className="font-semibold text-cyan-400 flex items-center gap-2">
                            <School className="h-4 w-4" />
                            {school.name}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                            {schoolMentions.map(mention => (
                              <Card key={mention._id} className="border-white/10 bg-white/5 backdrop-blur-sm">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium text-white">{mention.name}</h4>
                                      <p className="text-sm text-gray-400 mt-1">{mention.description || "Aucune description"}</p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-white/10 text-gray-400 hover:text-cyan-400"
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-white/10 text-gray-400 hover:text-red-400"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Filieres Tab - CORRIGÉ */}
          <TabsContent value="filieres" className="space-y-4">
            {loading ? (
              <TabSkeleton />
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Filières</h2>
                  <Button
                    onClick={() => {
                      setEditingItem(null)
                      setFiliereForm({ name: "", description: "", duration: "", credits: 0, mentionId: "", level: "" })
                      setFiliereDialogOpen(true)
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une filière
                  </Button>
                </div>

                {mentions.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                    <Layers className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Créez d'abord une mention</h3>
                    <p className="text-gray-400">Les filières sont rattachées à une mention</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {mentions.map(mention => {
                      const mentionFilieres = filieres.filter(f => f.mention._id === mention._id)
                      if (mentionFilieres.length === 0) return null
                      
                      return (
                        <div key={mention._id}>
                          <h3 className="font-semibold text-purple-400 flex items-center gap-2 mb-3">
                            <BookOpen className="h-4 w-4" />
                            {mention.name}
                            <Badge className="ml-2 border-purple-500/30 bg-purple-500/10 text-purple-400">
                              {mentionFilieres.length} filières
                            </Badge>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-6">
                            {mentionFilieres.map(filiere => (
                              <motion.div
                                key={filiere._id}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Card className="border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 group overflow-hidden">
                                  <div className={`h-1 bg-gradient-to-r ${
                                    filiere.level?.startsWith("Licence") ? "from-blue-500 to-cyan-500" :
                                    filiere.level?.startsWith("Master") ? "from-purple-500 to-pink-500" :
                                    filiere.level?.startsWith("Doctorat") ? "from-amber-500 to-orange-500" :
                                    "from-green-500 to-emerald-500"
                                  }`} />
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                                        {filiere.name}
                                      </h4>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingItem(filiere)
                                            setFiliereForm({
                                              name: filiere.name,
                                              description: filiere.description || "",
                                              duration: filiere.duration || "",
                                              credits: filiere.credits || 0,
                                              mentionId: filiere.mention._id,
                                              level: filiere.level,
                                            })
                                            setFiliereDialogOpen(true)
                                          }}
                                          className="hover:bg-white/10 text-gray-400 hover:text-cyan-400"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      <Badge className={cn(
                                        "border",
                                        filiere.level?.startsWith("Licence") && "border-blue-500/30 bg-blue-500/10 text-blue-400",
                                        filiere.level?.startsWith("Master") && "border-purple-500/30 bg-purple-500/10 text-purple-400",
                                        filiere.level?.startsWith("Doctorat") && "border-amber-500/30 bg-amber-500/10 text-amber-400",
                                        filiere.level?.startsWith("Bachelor") && "border-green-500/30 bg-green-500/10 text-green-400"
                                      )}>
                                        {filiere.level}
                                      </Badge>
                                      {filiere.duration && (
                                        <Badge variant="outline" className="border-white/20 text-gray-300">
                                          {filiere.duration}
                                        </Badge>
                                      )}
                                      {filiere.credits > 0 && (
                                        <Badge variant="outline" className="border-white/20 text-gray-300">
                                          {filiere.credits} crédits
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2">
                                      {filiere.description || "Aucune description"}
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* School Dialog */}
      <Dialog open={schoolDialogOpen} onOpenChange={setSchoolDialogOpen}>
        <DialogContent className="bg-[oklch(0.21_0.045_270)] border-white/15 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-cyan-400" />
              {editingItem ? "Modifier l'école" : "Ajouter une école"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingItem ? "Modifiez les informations de l'école" : "Créez une nouvelle école ou institut"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nom de l'école *</Label>
              <Input
                value={schoolForm.name}
                onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                placeholder="Faculté des Sciences"
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={schoolForm.description}
                onChange={(e) => setSchoolForm({ ...schoolForm, description: e.target.value })}
                placeholder="Description de l'école..."
                rows={3}
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSchoolDialogOpen(false)}
              className="border-white/20 text-gray-300 hover:bg-white/10"
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveSchool}
              disabled={submitting || !schoolForm.name}
              className="bg-gradient-to-r from-cyan-500 to-violet-500"
            >
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mention Dialog */}
      <Dialog open={mentionDialogOpen} onOpenChange={setMentionDialogOpen}>
        <DialogContent className="bg-[oklch(0.21_0.045_270)] border-white/15 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-400" />
              Ajouter une mention
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">École *</Label>
              <Select value={mentionForm.schoolId} onValueChange={(v) => setMentionForm({ ...mentionForm, schoolId: v })}>
                <SelectTrigger className="bg-white/5 border-white/15 text-white">
                  <SelectValue placeholder="Sélectionnez une école" />
                </SelectTrigger>
                <SelectContent className="bg-[oklch(0.21_0.045_270)] border-white/15">
                  {schools.map(school => (
                    <SelectItem key={school._id} value={school._id} className="text-white hover:bg-white/10">
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Nom de la mention *</Label>
              <Input
                value={mentionForm.name}
                onChange={(e) => setMentionForm({ ...mentionForm, name: e.target.value })}
                placeholder="Informatique"
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={mentionForm.description}
                onChange={(e) => setMentionForm({ ...mentionForm, description: e.target.value })}
                rows={3}
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMentionDialogOpen(false)}
              className="border-white/20 text-gray-300 hover:bg-white/10"
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveMention}
              disabled={submitting || !mentionForm.name || !mentionForm.schoolId}
              className="bg-gradient-to-r from-cyan-500 to-violet-500"
            >
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filiere Dialog */}
      <Dialog open={filiereDialogOpen} onOpenChange={setFiliereDialogOpen}>
        <DialogContent className="bg-[oklch(0.21_0.045_270)] border-white/15 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              {editingItem ? "Modifier la filière" : "Ajouter une filière"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Mention *</Label>
              <Select value={filiereForm.mentionId} onValueChange={(v) => setFiliereForm({ ...filiereForm, mentionId: v })}>
                <SelectTrigger className="bg-white/5 border-white/15 text-white">
                  <SelectValue placeholder="Sélectionnez une mention" />
                </SelectTrigger>
                <SelectContent className="bg-[oklch(0.21_0.045_270)] border-white/15">
                  {mentions.map(mention => (
                    <SelectItem key={mention._id} value={mention._id} className="text-white hover:bg-white/10">
                      {mention.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Niveau *</Label>
              <Select value={filiereForm.level} onValueChange={(v) => setFiliereForm({ ...filiereForm, level: v })}>
                <SelectTrigger className="bg-white/5 border-white/15 text-white">
                  <SelectValue placeholder="Sélectionnez un niveau" />
                </SelectTrigger>
                <SelectContent className="bg-[oklch(0.21_0.045_270)] border-white/15">
                  {levels.map(level => (
                    <SelectItem key={level} value={level} className="text-white hover:bg-white/10">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Nom de la filière *</Label>
              <Input
                value={filiereForm.name}
                onChange={(e) => setFiliereForm({ ...filiereForm, name: e.target.value })}
                placeholder="Génie Logiciel"
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Durée</Label>
                <Input
                  value={filiereForm.duration}
                  onChange={(e) => setFiliereForm({ ...filiereForm, duration: e.target.value })}
                  placeholder="3 ans"
                  className="bg-white/5 border-white/15 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Crédits ECTS</Label>
                <Input
                  type="number"
                  value={filiereForm.credits}
                  onChange={(e) => setFiliereForm({ ...filiereForm, credits: parseInt(e.target.value) || 0 })}
                  placeholder="180"
                  className="bg-white/5 border-white/15 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={filiereForm.description}
                onChange={(e) => setFiliereForm({ ...filiereForm, description: e.target.value })}
                rows={3}
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFiliereDialogOpen(false)}
              className="border-white/20 text-gray-300 hover:bg-white/10"
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveFiliere}
              disabled={submitting || !filiereForm.name || !filiereForm.mentionId || !filiereForm.level}
              className="bg-gradient-to-r from-cyan-500 to-violet-500"
            >
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}