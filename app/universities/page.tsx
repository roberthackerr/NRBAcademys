// app/universities/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Building2, Search, MapPin, Globe, Users, BookOpen, 
  ChevronRight, Filter, Loader2, GraduationCap, Award,
  TrendingUp, Star, Sparkles, Network, Radio, Zap,
  School, Library, Target, Heart, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/nav"

interface University {
  _id: string
  name: string
  name_en: string
  location: string
  country: string
  continent: string
  logo?: string
  email: string
  website?: string
  studentsCount: number
  programsCount: number
  partnerships: number
  ranking?: number
  rating?: number
  type: "public" | "private"
  status: string
  createdAt: string
}

export default function UniversitiesPage() {
  const { data: session } = useSession()
  const [universities, setUniversities] = useState<University[]>([])
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContinent, setSelectedContinent] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [sortBy, setSortBy] = useState("students")

  useEffect(() => {
    fetchUniversities()
  }, [])

  useEffect(() => {
    filterAndSortUniversities()
  }, [universities, searchQuery, selectedContinent, selectedType, sortBy])

  const fetchUniversities = async () => {
    try {
      const res = await fetch("/api/academic-data?type=universities")
      const data = await res.json()
      if (data.success) {
        setUniversities(data.data)
        setFilteredUniversities(data.data)
      }
    } catch (error) {
      console.error("Error fetching universities:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortUniversities = () => {
    let filtered = [...universities]
    
    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(uni => 
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (uni.name_en && uni.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        uni.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Filtre par continent
    if (selectedContinent !== "all") {
      filtered = filtered.filter(uni => uni.continent === selectedContinent)
    }
    
    // Filtre par type
    if (selectedType !== "all") {
      filtered = filtered.filter(uni => uni.type === selectedType)
    }
    
    // Tri
    switch (sortBy) {
      case "students":
        filtered.sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
        break
      case "programs":
        filtered.sort((a, b) => (b.programsCount || 0) - (a.programsCount || 0))
        break
      case "partnerships":
        filtered.sort((a, b) => (b.partnerships || 0) - (a.partnerships || 0))
        break
      case "ranking":
        filtered.sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }
    
    setFilteredUniversities(filtered)
  }

  const getContinentFlag = (continent: string) => {
    const flags: Record<string, string> = {
      "Afrique": "🌍",
      "Europe": "🇪🇺",
      "Asie": "🌏",
      "Amérique du Nord": "🌎",
      "Amérique du Sud": "🌎",
      "Océanie": "🌏"
    }
    return flags[continent] || "🌍"
  }

  const getTypeBadge = (type: string) => {
    return type === "public" 
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-purple-500/20 text-purple-400 border-purple-500/30"
  }

  const continents = ["all", ...new Set(universities.map(u => u.continent).filter(Boolean))]

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-6 w-6 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Universités partenaires
            </h1>
          </div>
          <p className="text-slate-400">
            Découvrez notre réseau d'universités à travers le monde
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-cyan-500/30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <Input
                type="text"
                placeholder="Rechercher une université..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-cyan-950/20 border-cyan-500/30 text-white placeholder:text-cyan-400/30"
              />
            </div>
            
            <Select value={selectedContinent} onValueChange={setSelectedContinent}>
              <SelectTrigger className="w-full md:w-48 bg-cyan-950/20 border-cyan-500/30 text-white">
                <SelectValue placeholder="Continent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌍 Tous les continents</SelectItem>
                {continents.filter(c => c !== "all").map(continent => (
                  <SelectItem key={continent} value={continent}>
                    {getContinentFlag(continent)} {continent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-40 bg-cyan-950/20 border-cyan-500/30 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🏛️ Tous</SelectItem>
                <SelectItem value="public">🏢 Publique</SelectItem>
                <SelectItem value="private">🏛️ Privée</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-cyan-950/20 border-cyan-500/30 text-white">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students">👨‍🎓 Nombre d'étudiants</SelectItem>
                <SelectItem value="programs">📚 Nombre de programmes</SelectItem>
                <SelectItem value="partnerships">🤝 Partenariats</SelectItem>
                <SelectItem value="ranking">🏆 Classement</SelectItem>
                <SelectItem value="name">🔤 Nom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 text-center border border-purple-500/30">
            <Building2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{filteredUniversities.length}</p>
            <p className="text-sm text-slate-400">Universités</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 text-center border border-blue-500/30">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {filteredUniversities.reduce((sum, u) => sum + (u.studentsCount || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-slate-400">Étudiants</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 text-center border border-emerald-500/30">
            <BookOpen className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {filteredUniversities.reduce((sum, u) => sum + (u.programsCount || 0), 0)}
            </p>
            <p className="text-sm text-slate-400">Programmes</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 text-center border border-amber-500/30">
            <Globe className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{continents.length - 1}</p>
            <p className="text-sm text-slate-400">Continents</p>
          </div>
        </div>

        {/* Universities Grid */}
        {filteredUniversities.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-16 text-center border border-cyan-500/30">
            <Building2 className="w-20 h-20 text-cyan-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">Aucune université trouvée</h3>
            <p className="text-slate-400">Aucune université ne correspond à vos critères</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedContinent("all")
                setSelectedType("all")
              }}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-violet-600"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((uni, index) => (
              <motion.div
                key={uni._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/universities/${uni._id}`}>
                  <Card className="group border-cyan-500/30 bg-white/5 backdrop-blur-sm hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                          {uni.logo ? (
                            <img src={uni.logo} alt={uni.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Building2 className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition line-clamp-1">
                              {uni.name}
                            </h3>
                            <Badge className={getTypeBadge(uni.type)}>
                              {uni.type === "public" ? "Publique" : "Privée"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{uni.location}, {uni.country}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-cyan-400 mt-1">
                            <span>{getContinentFlag(uni.continent)}</span>
                            <span>{uni.continent}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-cyan-500/30">
                        <div className="text-center">
                          <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                          <p className="text-white font-bold text-sm">{uni.studentsCount?.toLocaleString() || "N/C"}</p>
                          <p className="text-[10px] text-slate-500">Étudiants</p>
                        </div>
                        <div className="text-center">
                          <BookOpen className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                          <p className="text-white font-bold text-sm">{uni.programsCount || "N/C"}</p>
                          <p className="text-[10px] text-slate-500">Programmes</p>
                        </div>
                        <div className="text-center">
                          <Award className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                          <p className="text-white font-bold text-sm">{uni.partnerships || 0}</p>
                          <p className="text-[10px] text-slate-500">Partenariats</p>
                        </div>
                      </div>
                      
                      {uni.ranking && (
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-amber-400" />
                            <span className="text-xs text-amber-400">Rank #{uni.ranking}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Lien vers mon université (si l'utilisateur en a une) */}
        {session?.user && (
          <div className="mt-8 pt-8 border-t border-cyan-500/30">
            <div className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-2xl p-6 border border-cyan-500/30">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Mon université</h3>
                    <p className="text-slate-400 text-sm">Accédez à votre université et à son actualité</p>
                  </div>
                </div>
                <Link href="/dashboard/university">
                  <Button className="bg-gradient-to-r from-cyan-500 to-violet-600">
                    Voir mon université
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}