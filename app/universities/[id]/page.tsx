// app/universities/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  Building2, MapPin, Globe, Mail, Phone, Calendar, Users, 
  BookOpen, Award, GraduationCap, School, Library, Target,
  ChevronRight, ExternalLink, Star, TrendingUp, Sparkles,
  Network, Radio, Zap, Crown, Shield, UserCheck, Heart,
  Share2, MessageCircle, Flag, Twitter, Linkedin, Facebook,
  ArrowLeft, Loader2, CheckCircle, AlertCircle, Newspaper,
  Eye, ThumbsUp, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/nav"
import { toast } from "sonner"

interface University {
  _id: string
  name: string
  name_en: string
  location: string
  country: string
  continent: string
  logo?: string
  coverImage?: string
  email: string
  phone?: string
  website?: string
  description?: string
  address?: string
  founded?: number
  type: "public" | "private"
  studentsCount: number
  programsCount: number
  partnerships: number
  ranking?: number
  rating?: number
  tags?: string[]
  socialMedia?: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
  stats?: {
    schoolsCount: number
    mentionsCount: number
    filieresCount: number
    professorsCount: number
    researchCenters: number
    newsCount: number
  }
  createdAt: string
}

interface School {
  _id: string
  name: string
  description?: string
  level?: string
  studentsCount?: number
  mentions?: Mention[]
}

interface Mention {
  _id: string
  name: string
  description?: string
  filieres?: Filiere[]
}

interface Filiere {
  _id: string
  name: string
  duration: string
  credits: number
  level: string
}

interface NewsItem {
  _id: string
  title: string
  excerpt: string
  category: string
  publishedAt: string
  views: number
  likes: number
}

export default function UniversityDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const universityId = params.id as string
  
  const [university, setUniversity] = useState<University | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [latestNews, setLatestNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isFollowing, setIsFollowing] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  
  const isUniversityAdmin = session?.user && (session.user as any).university === universityId

  useEffect(() => {
    fetchUniversityData()
    fetchLatestNews()
  }, [])

  const fetchUniversityData = async () => {
    setLoading(true)
    try {
      const uniRes = await fetch(`/api/universities/${universityId}`)
      const uniData = await uniRes.json()
      setUniversity(uniData)
      
      const schoolsRes = await fetch(`/api/academic-data?type=schools&universityId=${universityId}`)
      const schoolsData = await schoolsRes.json()
      if (schoolsData.success) {
        const schoolsWithDetails = await Promise.all(
          schoolsData.data.map(async (school: any) => {
            const mentionsRes = await fetch(`/api/academic-data?type=mentions&schoolId=${school._id}`)
            const mentionsData = await mentionsRes.json()
            
            let mentionsWithFilieres = []
            if (mentionsData.success) {
              mentionsWithFilieres = await Promise.all(
                mentionsData.data.map(async (mention: any) => {
                  const filieresRes = await fetch(`/api/academic-data?type=filieres&mentionId=${mention._id}`)
                  const filieresData = await filieresRes.json()
                  return {
                    ...mention,
                    filieres: filieresData.success ? filieresData.data : []
                  }
                })
              )
            }
            
            return {
              ...school,
              mentions: mentionsWithFilieres
            }
          })
        )
        setSchools(schoolsWithDetails)
      }
    } catch (error) {
      console.error("Error fetching university data:", error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const fetchLatestNews = async () => {
    try {
      const newsRes = await fetch(`/api/universities/${universityId}/news?limit=3`)
      const newsData = await newsRes.json()
      if (newsData.success) {
        setLatestNews(newsData.news)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
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

  const getTypeLabel = (type: string) => {
    return type === "public" ? "Publique" : "Privée"
  }

  const shareOnSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(`${university?.name} - ${university?.location}`)
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      copy: "#"
    }
    
    if (platform === "copy") {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Lien copié dans le presse-papier")
    } else {
      window.open(shareUrls[platform], "_blank", "noopener,noreferrer")
    }
    setShowShareMenu(false)
  }

  const navigateToMyUniversity = () => {
    router.push("/dashboard/university")
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

  if (!university) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24 text-center">
          <div className="max-w-md mx-auto">
            <Building2 className="w-20 h-20 text-cyan-400 mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-bold text-white mb-2">Université non trouvée</h1>
            <p className="text-slate-400 mb-6">L'université que vous recherchez n'existe pas ou a été supprimée.</p>
            <Button onClick={() => router.push("/universities")} className="bg-gradient-to-r from-cyan-500 to-violet-600">
              Voir toutes les universités
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
      <Navbar />
      
      {/* Cover Image */}
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-cyan-600/30 to-violet-600/30">
        {university.coverImage ? (
          <img src={university.coverImage} alt={university.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-violet-600/20" />
        )}
        
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition"
          >
            <Heart className={`h-5 w-5 ${isFollowing ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-[#0d0d35] rounded-xl border border-cyan-500/30 shadow-lg overflow-hidden z-10"
                >
                  <button onClick={() => shareOnSocial("twitter")} className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2">
                    <Twitter className="h-4 w-4" /> Twitter
                  </button>
                  <button onClick={() => shareOnSocial("linkedin")} className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </button>
                  <button onClick={() => shareOnSocial("facebook")} className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2">
                    <Facebook className="h-4 w-4" /> Facebook
                  </button>
                  <button onClick={() => shareOnSocial("copy")} className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 border-t border-cyan-500/30">
                    <Link className="h-4 w-4" /> Copier le lien
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Logo et infos */}
        <div className="absolute -bottom-16 left-6 md:left-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-2xl border-4 border-[#0d0d35] overflow-hidden">
            {university.logo ? (
              <img src={university.logo} alt={university.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="h-16 w-16 text-white" />
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{university.name}</h1>
              {university.name_en && <p className="text-slate-400 text-lg mt-1">{university.name_en}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white border-0">{getTypeLabel(university.type)}</Badge>
                <div className="flex items-center gap-1 text-slate-400"><MapPin className="h-4 w-4" />{university.location}, {university.country}</div>
                <div className="flex items-center gap-1 text-slate-400"><Globe className="h-4 w-4" />{university.continent}</div>
                {university.ranking && <Badge variant="outline" className="border-amber-500/30 text-amber-400"><Trophy className="h-3 w-3 mr-1" />Rank #{university.ranking}</Badge>}
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* ✅ Lien vers Mon université */}
              <Button onClick={navigateToMyUniversity} variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                <Building2 className="h-4 w-4 mr-2" />
                Mon université
              </Button>
              {university.website && (
                <a href={university.website.startsWith('http') ? university.website : `https://${university.website}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" /> Site web
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Users className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{university.studentsCount?.toLocaleString() || "N/C"}</p>
            <p className="text-[10px] text-slate-400">Étudiants</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <BookOpen className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{university.programsCount || "N/C"}</p>
            <p className="text-[10px] text-slate-400">Programmes</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <School className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{university.stats?.schoolsCount || schools.length}</p>
            <p className="text-[10px] text-slate-400">Écoles</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Award className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{university.ranking ? `#${university.ranking}` : "N/C"}</p>
            <p className="text-[10px] text-slate-400">Classement</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Globe className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{university.partnerships || 0}</p>
            <p className="text-[10px] text-slate-400">Partenariats</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Newspaper className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{university.stats?.newsCount || latestNews.length}</p>
            <p className="text-[10px] text-slate-400">Actualités</p>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-cyan-500/30 rounded-xl p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Aperçu</TabsTrigger>
            <TabsTrigger value="academics" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Académique</TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Statistiques</TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Contact</TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Newspaper className="h-4 w-4 mr-2" />
              Actualités
            </TabsTrigger>
          </TabsList>
          
          {/* Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-3">À propos</h2>
                <p className="text-slate-300 leading-relaxed">{university.description || `${university.name} est une institution d'enseignement supérieur de renom située à ${university.location}, ${university.country}. L'université est reconnue pour son excellence académique et son engagement dans la recherche internationale.`}</p>
                {university.founded && <div className="mt-4 flex items-center gap-2 text-slate-400"><Calendar className="h-4 w-4" /><span>Fondée en {university.founded}</span></div>}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Académique */}
          <TabsContent value="academics" className="space-y-6">
            {schools.length === 0 ? (
              <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-12 text-center"><School className="h-16 w-16 text-cyan-400 mx-auto mb-4 opacity-50" /><h3 className="text-xl font-medium text-white mb-2">Aucune information académique</h3><p className="text-slate-400">Les informations sur les formations ne sont pas encore disponibles.</p></CardContent>
              </Card>
            ) : (
              schools.map((school) => (
                <Card key={school._id} className="border-cyan-500/30 bg-white/5 backdrop-blur-sm overflow-hidden">
                  <CardHeader><CardTitle className="text-white flex items-center gap-2"><School className="h-5 w-5 text-cyan-400" />{school.name}</CardTitle></CardHeader>
                  <CardContent>
                    {school.description && <p className="text-slate-300 text-sm mb-4">{school.description}</p>}
                    {school.mentions?.length > 0 && (
                      <div className="space-y-4"><h4 className="text-sm font-semibold text-cyan-400">Mentions et filières</h4>
                        {school.mentions.map((mention) => (
                          <div key={mention._id} className="ml-4 pl-4 border-l-2 border-cyan-500/30">
                            <h5 className="text-white font-medium">{mention.name}</h5>
                            {mention.description && <p className="text-slate-400 text-sm mt-1">{mention.description}</p>}
                            {mention.filieres?.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{mention.filieres.map((filiere) => (<Badge key={filiere._id} variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">{filiere.name} ({filiere.duration})</Badge>))}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          {/* Statistiques */}
          <TabsContent value="statistics" className="space-y-6">
            <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Indicateurs clés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div><div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Taux de réussite</span><span className="text-white">87%</span></div><Progress value={87} className="h-2" /></div>
                    <div><div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Employabilité</span><span className="text-white">92%</span></div><Progress value={92} className="h-2" /></div>
                    <div><div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Satisfaction étudiante</span><span className="text-white">89%</span></div><Progress value={89} className="h-2" /></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl"><span className="text-slate-400">Écoles / Facultés</span><span className="text-white font-bold text-xl">{university.stats?.schoolsCount || schools.length}</span></div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl"><span className="text-slate-400">Programmes</span><span className="text-white font-bold text-xl">{university.programsCount || "N/C"}</span></div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl"><span className="text-slate-400">Centres de recherche</span><span className="text-white font-bold text-xl">{university.stats?.researchCenters || 12}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contact */}
          <TabsContent value="contact" className="space-y-6">
            <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Informations de contact</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-cyan-400" /><div><p className="text-sm text-slate-400">Email</p><a href={`mailto:${university.email}`} className="text-white hover:text-cyan-400 transition">{university.email}</a></div></div>
                  {university.phone && (<div className="flex items-center gap-3"><Phone className="h-5 w-5 text-cyan-400" /><div><p className="text-sm text-slate-400">Téléphone</p><a href={`tel:${university.phone}`} className="text-white hover:text-cyan-400 transition">{university.phone}</a></div></div>)}
                  {university.address && (<div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-cyan-400" /><div><p className="text-sm text-slate-400">Adresse</p><p className="text-white">{university.address}, {university.location}</p></div></div>)}
                  {university.website && (<div className="flex items-center gap-3"><Globe className="h-5 w-5 text-cyan-400" /><div><p className="text-sm text-slate-400">Site web</p><a href={university.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{university.website}</a></div></div>)}
                </div>
                {university.socialMedia && (<div className="mt-6 pt-4 border-t border-cyan-500/30"><h3 className="text-white font-semibold mb-3">Réseaux sociaux</h3><div className="flex gap-3">
                  {university.socialMedia.facebook && <a href={university.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"><Facebook className="h-5 w-5 text-cyan-400" /></a>}
                  {university.socialMedia.twitter && <a href={university.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"><Twitter className="h-5 w-5 text-cyan-400" /></a>}
                  {university.socialMedia.linkedin && <a href={university.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"><Linkedin className="h-5 w-5 text-cyan-400" /></a>}
                </div></div>)}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Actualités */}
          <TabsContent value="news" className="space-y-6">
            {/* ✅ Lien vers toutes les actualités */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Dernières actualités</h2>
              <Link href={`/universities/${universityId}/news`}>
                <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                  Voir toutes les actualités
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {latestNews.length === 0 ? (
              <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Newspaper className="h-16 w-16 text-cyan-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium text-white mb-2">Aucune actualité</h3>
                  <p className="text-slate-400">Aucune actualité n'a encore été publiée pour cette université.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {latestNews.map((news) => (
                  <Link key={news._id} href={`/universities/${universityId}/news/${news._id}`}>
                    <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm hover:border-cyan-500/60 transition-all cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-cyan-500/20 text-cyan-400">{news.category}</Badge>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="h-3 w-3" />
                                {formatDate(news.publishedAt)}
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2 hover:text-cyan-400 transition">{news.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2">{news.excerpt}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 text-xs text-slate-500 ml-4">
                            <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{news.views}</div>
                            <div className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{news.likes}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}