// app/signup/step2/page.tsx
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  ChevronLeft, ChevronRight, GraduationCap, School, BookOpen, 
  Award, Globe, Search, Building2, Shield, Sparkles, MapPin,
  Loader2, CheckCircle2, Network, Zap, Cpu, Users,
  TrendingUp, Star, Compass, Cloud, Database, Radio
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface University {
  _id: string
  name: string
  name_en: string
  location: string
  country: string
  continent: string
  website: string
  logo?: string
}

interface School {
  _id: string
  name: string
  description?: string
}

interface Mention {
  _id: string
  name: string
  description?: string
}

interface Filiere {
  _id: string
  name: string
  description?: string
  duration: string
  credits: number
  level: string
}

const niveaux = [
  { value: "L1", label: "Licence 1" },
  { value: "L2", label: "Licence 2" },
  { value: "L3", label: "Licence 3" },
  { value: "M1", label: "Master 1" },
  { value: "M2", label: "Master 2" },
  { value: "Doctorat", label: "Doctorat" }
]

export default function SignupStep2() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContinent, setSelectedContinent] = useState("all")
  
  const [universities, setUniversities] = useState<University[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [selectedSchool, setSelectedSchool] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedMention, setSelectedMention] = useState("")
  const [selectedFiliere, setSelectedFiliere] = useState("")
  const [selectedUniversityDetails, setSelectedUniversityDetails] = useState<University | null>(null)

  const [availableSchools, setAvailableSchools] = useState<School[]>([])
  const [availableMentions, setAvailableMentions] = useState<Mention[]>([])
  const [availableFilieres, setAvailableFilieres] = useState<Filiere[]>([])

  // ✅ Récupérer les universités
  const fetchUniversities = useCallback(async () => {
    setFetchingData(true)
    try {
      const response = await fetch('/api/academic-data?type=universities')
      if (!response.ok) throw new Error('Failed to fetch universities')
      const data = await response.json()
      setUniversities(data.data || [])
    } catch (error) {
      console.error('Error fetching universities:', error)
      toast.error("Erreur lors du chargement des universités")
    } finally {
      setFetchingData(false)
    }
  }, [])

  useEffect(() => {
    fetchUniversities()
  }, [fetchUniversities])

  // ✅ Vérifier les données de l'étape 1
  useEffect(() => {
    const signupData = sessionStorage.getItem("signupData")
    if (!signupData) {
      router.push("/signup")
    }
  }, [router])

  // ✅ Récupérer les écoles
  useEffect(() => {
    if (selectedUniversity) {
      const fetchSchools = async () => {
        try {
          const response = await fetch(`/api/academic-data?type=schools&universityId=${selectedUniversity}`)
          if (response.ok) {
            const data = await response.json()
            setAvailableSchools(data.data || [])
          }
        } catch (error) {
          console.error('Error fetching schools:', error)
          toast.error("Erreur lors du chargement des écoles")
        }
      }
      fetchSchools()
      
      const university = universities.find(u => u._id === selectedUniversity)
      setSelectedUniversityDetails(university || null)
      setSelectedSchool("")
      setSelectedLevel("")
      setSelectedMention("")
      setSelectedFiliere("")
    }
  }, [selectedUniversity, universities])

  // ✅ Récupérer les mentions
  useEffect(() => {
    if (selectedSchool) {
      const fetchMentions = async () => {
        try {
          const response = await fetch(`/api/academic-data?type=mentions&schoolId=${selectedSchool}`)
          if (response.ok) {
            const data = await response.json()
            setAvailableMentions(data.data || [])
          }
        } catch (error) {
          console.error('Error fetching mentions:', error)
        }
      }
      fetchMentions()
      setSelectedMention("")
      setSelectedFiliere("")
    }
  }, [selectedSchool])

  // ✅ Récupérer les filières
  useEffect(() => {
    if (selectedMention) {
      const fetchFilieres = async () => {
        try {
          const response = await fetch(`/api/academic-data?type=filieres&mentionId=${selectedMention}`)
          if (response.ok) {
            const data = await response.json()
            setAvailableFilieres(data.data || [])
          }
        } catch (error) {
          console.error('Error fetching filieres:', error)
        }
      }
      fetchFilieres()
      setSelectedFiliere("")
    }
  }, [selectedMention])

  // ✅ Filtrer les universités
  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (uni.name_en || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          uni.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesContinent = selectedContinent === "all" || uni.continent === selectedContinent
    return matchesSearch && matchesContinent
  })

  const continents = ["all", ...new Set(universities.map(uni => uni.continent).filter(Boolean))]

  // ✅ Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUniversity || !selectedSchool || !selectedLevel || !selectedMention || !selectedFiliere) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)

    try {
      const signupData = JSON.parse(sessionStorage.getItem("signupData") || "{}")
      
      const selectedFiliereData = availableFilieres.find(f => f._id === selectedFiliere)
      const selectedMentionData = availableMentions.find(m => m._id === selectedMention)
      const selectedSchoolData = availableSchools.find(s => s._id === selectedSchool)
      
      // ✅ Structure des données pour l'API
      const completeData = {
        ...signupData,
        // ✅ IDs MongoDB complets (ObjectId)
        university: selectedUniversity,  // Envoyer directement l'ID
        school: selectedSchool,          // Envoyer directement l'ID
        mention: selectedMention,        // Envoyer directement l'ID
        filiere: selectedFiliere,        // Envoyer directement l'ID
        level: selectedLevel,
        // Informations textuelles pour référence
        universityName: selectedUniversityDetails?.name,
        schoolName: selectedSchoolData?.name,
        mentionName: selectedMentionData?.name,
        filiereName: selectedFiliereData?.name,
        filiereDuration: selectedFiliereData?.duration,
        filiereCredits: selectedFiliereData?.credits,
        registrationDate: new Date().toISOString(),
      }

      console.log("📤 Envoi des données:", completeData)

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      sessionStorage.removeItem("signupData")
      toast.success("Inscription réussie !")
      router.push("/signup/step3?success=true")
    } catch (err: any) {
      console.error("Erreur:", err)
      toast.error(err.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            </div>
          </div>
          <p className="text-cyan-400/80 mt-4 font-mono text-sm tracking-wider">
            INITIALISATION DU RÉSEAU ACADÉMIQUE...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] relative overflow-hidden">
      {/* Holographic Grid Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0, 255, 255, 0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>

      {/* Floating Nodes */}
      <div className="absolute top-40 right-20 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-ping"></div>
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-violet-400 rounded-full shadow-lg shadow-violet-400/50 animate-pulse delay-700"></div>
      <div className="absolute top-60 left-1/3 w-1 h-1 bg-cyan-300 rounded-full"></div>
      <div className="absolute bottom-60 right-1/3 w-1 h-1 bg-violet-300 rounded-full"></div>

      <div className="max-w-4xl mx-auto relative z-10 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="backdrop-blur-xl bg-white/5 border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/20">
              <div className="flex justify-between items-center mb-4">
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-lg opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-cyan-500 to-violet-600 p-2 rounded-xl">
                      <Network className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
                    NEXUS ACADÉMIQUE
                  </span>
                </motion.div>
                <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
                  <Radio className="h-3 w-3" />
                  <span>CONNEXION SÉCURISÉE</span>
                </div>
              </div>
              
              <Progress value={66} className="h-1 bg-cyan-500/20" />
              
              <div className="mt-4">
                <span className="text-xs font-mono text-cyan-400/60 tracking-wider">ÉTAPE 02 — PARCOURS ACADÉMIQUE</span>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mt-2 tracking-tight">
                  Configurez Votre Nœud Académique
                </h1>
                <p className="text-cyan-100/50 text-sm mt-1">
                  Connectez-vous à votre institution et définissez votre trajectoire académique
                </p>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* University Selection */}
                <div className="space-y-3">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    NŒUD INSTITUTIONNEL
                  </Label>
                  
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400/50" />
                      <Input
                        placeholder="Rechercher une université..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20"
                      />
                    </div>
                    <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                      <SelectTrigger className="w-40 bg-cyan-950/20 border-cyan-500/30 text-cyan-100">
                        <SelectValue placeholder="Continent" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d0d35] border-cyan-500/30">
                        {continents.map(continent => (
                          <SelectItem key={continent} value={continent} className="text-cyan-100 hover:bg-cyan-500/20">
                            {continent === "all" ? "🌍 TOUS" : continent.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                    <SelectTrigger className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100 hover:border-cyan-400 transition-colors">
                      <SelectValue placeholder="Sélectionner l'université" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d0d35] border-cyan-500/30 max-h-80">
                      {filteredUniversities.map((uni) => (
                        <SelectItem key={uni._id} value={uni._id} className="text-cyan-100 hover:bg-cyan-500/20">
                          <div className="flex flex-col">
                            <span className="font-medium">{uni.name}</span>
                            <span className="text-xs text-cyan-400/60">
                              {uni.location}, {uni.country} • {uni.continent}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* University Info Card */}
                <AnimatePresence>
                  {selectedUniversityDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 p-4"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
                      <div className="flex items-start justify-between relative z-10">
                        <div>
                          <h4 className="font-semibold text-cyan-100 flex items-center gap-2">
                            <Award className="h-4 w-4 text-cyan-400" />
                            {selectedUniversityDetails.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-cyan-400/70">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {selectedUniversityDetails.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {selectedUniversityDetails.continent}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-violet-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* School Selection */}
                {selectedUniversity && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                      <School className="h-3 w-3" />
                      FACULTÉ / ÉCOLE
                    </Label>
                    <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                      <SelectTrigger className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100">
                        <SelectValue placeholder="Sélectionner la faculté" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d0d35] border-cyan-500/30">
                        {availableSchools.map((school) => (
                          <SelectItem key={school._id} value={school._id} className="text-cyan-100 hover:bg-cyan-500/20">
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Level */}
                  {selectedSchool && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      <Label className="text-xs font-mono text-cyan-400 tracking-wider">
                        NIVEAU D'ÉTUDE
                      </Label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100">
                          <SelectValue placeholder="Sélectionner le niveau" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0d35] border-cyan-500/30">
                          {niveaux.map((niveau) => (
                            <SelectItem key={niveau.value} value={niveau.value} className="text-cyan-100 hover:bg-cyan-500/20">
                              {niveau.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  {/* Mention */}
                  {selectedSchool && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      <Label className="text-xs font-mono text-cyan-400 tracking-wider">
                        MENTION
                      </Label>
                      <Select value={selectedMention} onValueChange={setSelectedMention}>
                        <SelectTrigger className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100">
                          <SelectValue placeholder="Sélectionner la mention" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0d35] border-cyan-500/30">
                          {availableMentions.map((mention) => (
                            <SelectItem key={mention._id} value={mention._id} className="text-cyan-100 hover:bg-cyan-500/20">
                              {mention.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>

                {/* Filière */}
                {selectedMention && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      SPÉCIALISATION / FILIÈRE
                    </Label>
                    <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
                      <SelectTrigger className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100">
                        <SelectValue placeholder="Sélectionner la spécialisation" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d0d35] border-cyan-500/30">
                        {availableFilieres.map((filiere) => (
                          <SelectItem key={filiere._id} value={filiere._id} className="text-cyan-100 hover:bg-cyan-500/20">
                            <div className="flex justify-between w-full">
                              <span>{filiere.name}</span>
                              <span className="text-xs text-cyan-400/60 ml-4">
                                {filiere.duration} • {filiere.credits} crédits
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                {/* Selection Summary */}
                <AnimatePresence>
                  {selectedFiliere && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 p-4"
                    >
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs font-mono text-cyan-400 tracking-wider">PARCOURS CONFIRMÉ</span>
                        </div>
                        <p className="text-sm text-cyan-100">
                          Vous rejoignez : <span className="font-semibold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                            {availableFilieres.find(f => f._id === selectedFiliere)?.name}
                          </span>
                        </p>
                        <p className="text-xs text-cyan-400/60 mt-1">
                          Mention: {availableMentions.find(m => m._id === selectedMention)?.name}
                          {selectedLevel && ` • Niveau: ${niveaux.find(n => n.value === selectedLevel)?.label}`}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/signup")}
                    className="flex-1 bg-transparent border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    RETOUR
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !selectedUniversity || !selectedSchool || !selectedLevel || !selectedMention || !selectedFiliere}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>INITIALISATION...</span>
                      </div>
                    ) : (
                      <>
                        <span>CONTINUER VERS L'ÉTAPE FINALE</span>
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-500/20 bg-cyan-950/10">
              <div className="flex items-center justify-between text-xs text-cyan-400/50 font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    {universities.length} INSTITUTIONS
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    RÉSEAU MONDIAL
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span>CONNEXION SÉCURISÉE</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}