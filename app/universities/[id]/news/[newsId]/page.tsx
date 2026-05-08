// app/universities/[id]/news/[newsId]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft, Calendar, User, Eye, Heart, Tag, Share2,
  Clock, ChevronRight, Loader2, Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navbar } from "@/components/nav"
import { toast } from "sonner"

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const universityId = params.id as string
  const newsId = params.newsId as string
  
  const [news, setNews] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewsDetail()
  }, [])

  const fetchNewsDetail = async () => {
    try {
      const res = await fetch(`/api/universities/${universityId}/news/${newsId}`)
      const data = await res.json()
      if (data.success) {
        setNews(data.news)
      }
    } catch (error) {
      console.error("Error fetching news detail:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24 text-center">
          <h1 className="text-2xl font-bold text-white">Actualité non trouvée</h1>
          <Link href={`/universities/${universityId}/news`} className="text-cyan-400 hover:underline mt-4 inline-block">
            Retour aux actualités
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white border-0">
                  {news.category}
                </Badge>
                {news.priority === "high" && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    Important
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {news.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={news.publishedBy?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-violet-600 text-white text-xs">
                      {news.publishedBy?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm">{news.publishedBy?.name}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(news.publishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Eye className="h-4 w-4" />
                  {news.views} vues
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {news.content}
                </p>
              </div>
              
              {news.tags && news.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-cyan-500/30">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-cyan-400" />
                    {news.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">
                        #{tag}
                      </span>
                    ))}
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