// app/universities/[id]/news/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  Newspaper, Calendar, User, Eye, Heart, Tag, Filter,
  ChevronLeft, ChevronRight, Loader2, Plus, X,
  Building2, Sparkles, Clock, Award, TrendingUp, Zap,
  Megaphone, Calendar as CalendarIcon, Trophy, BookOpen, FlaskConical,
  Upload, Image as ImageIcon, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/nav"
import { toast } from "sonner"

interface NewsItem {
  _id: string
  title: string
  content: string
  excerpt: string
  image?: string
  category: "announcement" | "event" | "achievement" | "academic" | "research" | "general"
  priority: "high" | "normal" | "low"
  publishedBy: {
    _id: string
    name: string
    avatar?: string
  }
  publishedAt: string
  views: number
  likes: number
  tags: string[]
}

const categoryConfig = {
  announcement: { label: "Annonce", icon: Megaphone, color: "from-blue-500 to-cyan-500" },
  event: { label: "Événement", icon: CalendarIcon, color: "from-purple-500 to-pink-500" },
  achievement: { label: "Réalisation", icon: Trophy, color: "from-amber-500 to-orange-500" },
  academic: { label: "Académique", icon: BookOpen, color: "from-emerald-500 to-teal-500" },
  research: { label: "Recherche", icon: FlaskConical, color: "from-violet-500 to-purple-500" },
  general: { label: "Général", icon: Newspaper, color: "from-slate-500 to-gray-500" }
}

export default function UniversityNewsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const universityId = params.id as string
  
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "general",
    priority: "normal",
    tags: "",
    image: null as File | null,
    imagePreview: null as string | null
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkAdminStatus()
    fetchNews()
  }, [page, selectedCategory])

  const checkAdminStatus = async () => {
    if (!session?.user) return
    try {
      const res = await fetch(`/api/universities/${universityId}/admin-check`)
      const data = await res.json()
      setIsAdmin(data.isAdmin)
    } catch (error) {
      console.error("Error checking admin status:", error)
    }
  }

  const fetchNews = async () => {
    setLoading(true)
    try {
      const url = `/api/universities/${universityId}/news?page=${page}&limit=10&category=${selectedCategory}`
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success) {
        if (page === 1) {
          setNews(data.news)
        } else {
          setNews(prev => [...prev, ...data.news])
        }
        setHasMore(data.pagination.page < data.pagination.pages)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
      toast.error("Erreur lors du chargement des actualités")
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB")
      return
    }
    
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou WEBP")
      return
    }
    
    setUploadingImage(true)
    setFormData({ ...formData, image: file })
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imagePreview: reader.result as string }))
      setUploadingImage(false)
    }
    reader.onerror = () => {
      toast.error("Erreur lors du chargement de l'image")
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData({ ...formData, image: null, imagePreview: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content || !formData.excerpt) {
      toast.error("Veuillez remplir tous les champs requis")
      return
    }
    
    setSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("excerpt", formData.excerpt)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("priority", formData.priority)
      formDataToSend.append("tags", formData.tags)
      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }
      
      const res = await fetch(`/api/universities/${universityId}/news`, {
        method: "POST",
        body: formDataToSend
      })
      
      if (!res.ok) throw new Error("Erreur lors de la création")
      
      toast.success("Actualité publiée avec succès !")
      setShowCreateModal(false)
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "general",
        priority: "normal",
        tags: "",
        image: null,
        imagePreview: null
      })
      setPage(1)
      fetchNews()
    } catch (error) {
      console.error("Error creating news:", error)
      toast.error("Erreur lors de la création")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return "Hier"
    if (days < 7) return `Il y a ${days} jours`
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  }

  const categories = ["all", ...Object.keys(categoryConfig)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="h-6 w-6 text-cyan-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Actualités
              </h1>
            </div>
            <p className="text-slate-400">Restez informé des dernières nouvelles de votre université</p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Publier une actualité
            </Button>
          )}
        </div>

        {/* Categories Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => {
            const config = categoryConfig[cat as keyof typeof categoryConfig]
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? `bg-gradient-to-r ${config?.color || "from-cyan-500 to-violet-600"} text-white shadow-lg`
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {config?.icon && <config.icon className="h-4 w-4 inline mr-2" />}
                {cat === "all" ? "Tous" : config?.label}
              </button>
            )
          })}
        </div>

        {/* News Grid */}
        {loading && news.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-cyan-500/30">
            <Newspaper className="h-16 w-16 text-cyan-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">Aucune actualité</h3>
            <p className="text-slate-400">
              {isAdmin 
                ? "Soyez le premier à publier une actualité"
                : "Aucune actualité pour le moment"}
            </p>
            {isAdmin && (
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="outline"
                className="mt-4 border-cyan-500/30 text-cyan-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Publier une actualité
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => {
              const config = categoryConfig[item.category]
              const Icon = config.icon
              const priorityColors = {
                high: "border-l-4 border-l-red-500",
                normal: "",
                low: "opacity-70"
              }
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 transition-all ${priorityColors[item.priority as keyof typeof priorityColors]}`}
                >
                  {item.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`bg-gradient-to-r ${config.color} text-white border-0`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        {item.priority === "high" && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            Important
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {item.likes}
                        </div>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2 hover:text-cyan-400 transition cursor-pointer">
                      {item.title}
                    </h2>
                    
                    <p className="text-slate-400 mb-3">{item.excerpt}</p>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-cyan-500/30">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.publishedBy.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-violet-600 text-white text-xs">
                            {item.publishedBy.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-400">{item.publishedBy.name}</span>
                        <span className="text-slate-600">•</span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.publishedAt)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-400 hover:text-cyan-300"
                        onClick={() => router.push(`/universities/${universityId}/news/${item._id}`)}
                      >
                        Lire la suite
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            
            {hasMore && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  className="border-cyan-500/30 text-cyan-400"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                  Charger plus
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Création d'actualité avec upload d'image */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-violet-600 p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Publier une actualité</h2>
                  <p className="text-cyan-200 text-sm">Partagez une information avec votre université</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <form onSubmit={handleCreateNews} className="p-6 space-y-5">
                <div>
                  <Label className="text-cyan-400 text-sm font-medium mb-1 block">Titre *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de l'actualité"
                    className="bg-white/5 border-cyan-500/30 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-cyan-400 text-sm font-medium mb-1 block">Résumé *</Label>
                  <Input
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Court résumé (150 caractères max)"
                    className="bg-white/5 border-cyan-500/30 text-white"
                    required
                  />
                </div>
                
                {/* Upload d'image */}
                <div>
                  <Label className="text-cyan-400 text-sm font-medium mb-1 block">Image à la une</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  
                  {formData.imagePreview ? (
                    <div className="relative group">
                      <img 
                        src={formData.imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl border border-cyan-500/30"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center hover:border-cyan-500/60 transition cursor-pointer bg-white/5"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                      ) : (
                        <>
                          <ImageIcon className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">Cliquez pour ajouter une image</p>
                          <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (max 5MB)</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-cyan-400 text-sm font-medium mb-1 block">Contenu *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Contenu détaillé de l'actualité"
                    rows={6}
                    className="bg-white/5 border-cyan-500/30 text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-cyan-400 text-sm font-medium mb-1 block">Catégorie</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-cyan-400 text-sm font-medium mb-1 block">Priorité</Label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-cyan-400 text-sm font-medium mb-1 block">Tags (séparés par des virgules)</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="innovation, recherche, événement"
                    className="bg-white/5 border-cyan-500/30 text-white"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 text-white"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Publier
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 border-cyan-500/30 text-cyan-400"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}