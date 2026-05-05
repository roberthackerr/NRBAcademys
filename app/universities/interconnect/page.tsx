// app/universities/interconnect/page.tsx
"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Globe, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  MapPin,
  Sparkles,
  Network,
  Radio,
  Zap,
  Crown,
  Shield,
  GraduationCap,
  Building2,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Star,
  Trophy,
  Target,
  X
} from 'lucide-react'
import { Navbar } from '@/components/nav'
import { useSession } from 'next-auth/react'

interface University {
  _id: string
  name: string
  location: string
  country: string
  continent: string
  logo?: string
  website?: string
  description?: string
  studentsCount: number
  programsCount: number
  partnerships: number
  ranking?: number
  rating?: number
  tags?: string[]
  established?: number
  type?: 'public' | 'private'
}

interface Partnership {
  _id: string
  universityId: string
  partnerId: string
  status: 'pending' | 'active' | 'declined'
  type: 'academic' | 'research' | 'student_exchange' | 'dual_degree'
  createdAt: Date
  updatedAt: Date
  university?: University
  partner?: University
}

export default function InterconnectPage() {
  const { data: session } = useSession()
  const [universities, setUniversities] = useState<University[]>([])
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContinent, setSelectedContinent] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [activeTab, setActiveTab] = useState<'explore' | 'myPartnerships'>('explore')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchUniversities()
    if (session?.user) {
      fetchPartnerships()
    }
  }, [session])

  const fetchUniversities = async () => {
    try {
      const res = await fetch('/api/universities')
      const data = await res.json()
      setUniversities(data.universities || data)
    } catch (error) {
      console.error('Error fetching universities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPartnerships = async () => {
    try {
      const res = await fetch('/api/universities/partnerships')
      const data = await res.json()
      setPartnerships(data.partnerships || data)
    } catch (error) {
      console.error('Error fetching partnerships:', error)
    }
  }

  const sendPartnershipRequest = async (universityId: string) => {
    setSendingRequest(true)
    try {
      const res = await fetch('/api/universities/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: universityId, type: 'academic' })
      })
      
      if (res.ok) {
        await fetchPartnerships()
        alert('Demande de partenariat envoyée !')
      }
    } catch (error) {
      console.error('Error sending partnership request:', error)
      alert('Erreur lors de l\'envoi de la demande')
    } finally {
      setSendingRequest(false)
    }
  }

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (uni.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesContinent = selectedContinent === 'all' || uni.continent === selectedContinent
    const matchesType = selectedType === 'all' || uni.type === selectedType
    return matchesSearch && matchesContinent && matchesType
  })

  const continents = ['all', ...new Set(universities.map(u => u.continent).filter(Boolean))]

  const getPartnershipStatus = (universityId: string) => {
    const partnership = partnerships.find(p => 
      (p.universityId === universityId || p.partnerId === universityId) && 
      p.status === 'active'
    )
    return partnership?.status
  }

  const isPendingRequest = (universityId: string) => {
    return partnerships.some(p => 
      (p.partnerId === universityId) && p.status === 'pending'
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Interconnexion Universitaire
                </h1>
              </div>
              <p className="text-slate-400">
                Connectez votre université avec des partenaires académiques mondiaux
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
              <Radio className="h-3 w-3" />
              <span>{universities.length} UNIVERSITÉS CONNECTÉES</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-cyan-500/30">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'explore' 
                ? 'text-cyan-400' 
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            Explorer
            {activeTab === 'explore' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-600"
              />
            )}
          </button>
          {session?.user && (
            <button
              onClick={() => setActiveTab('myPartnerships')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'myPartnerships' 
                  ? 'text-cyan-400' 
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Mes partenariats
              {activeTab === 'myPartnerships' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-600"
                />
              )}
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-cyan-500/30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="Rechercher une université..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white placeholder:text-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            
            <select
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="px-4 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">🌍 Tous les continents</option>
              {continents.filter(c => c !== 'all').map(continent => (
                <option key={continent} value={continent}>{continent}</option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">🏛️ Tous types</option>
              <option value="public">🏢 Publique</option>
              <option value="private">🏛️ Privée</option>
            </select>
          </div>
        </div>

        {/* Universities Grid - Explore */}
        {activeTab === 'explore' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((uni, index) => (
              <motion.div
                key={uni._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 transition-all duration-300 group"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
                        {uni.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {uni.location}, {uni.country}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                    {uni.description || `${uni.name} est une institution d'enseignement supérieur de renom, engagée dans l'excellence académique et la recherche internationale.`}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-4 pt-2 border-t border-cyan-500/20">
                    <div className="text-center">
                      <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{uni.studentsCount?.toLocaleString() || '10k+'}</p>
                      <p className="text-[10px] text-slate-500">Étudiants</p>
                    </div>
                    <div className="text-center">
                      <BookOpen className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{uni.programsCount || 50}+</p>
                      <p className="text-[10px] text-slate-500">Programmes</p>
                    </div>
                    <div className="text-center">
                      <Globe className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{uni.partnerships || 0}</p>
                      <p className="text-[10px] text-slate-500">Partenariats</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {getPartnershipStatus(uni._id) === 'active' ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Partenaire
                      </span>
                    ) : isPendingRequest(uni._id) ? (
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium">
                        Demande envoyée
                      </span>
                    ) : (
                      <button
                        onClick={() => sendPartnershipRequest(uni._id)}
                        disabled={sendingRequest}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50"
                      >
                        Demander un partenariat
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedUniversity(uni)
                        setShowDetails(true)
                      }}
                      className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 text-sm"
                    >
                      Détails <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* My Partnerships Tab */}
        {activeTab === 'myPartnerships' && (
          <div className="space-y-4">
            {partnerships.filter(p => p.status === 'active').length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 text-center border border-cyan-500/30">
                <Network className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">Aucun partenariat</h3>
                <p className="text-slate-400">
                  Commencez à explorer et à contacter d'autres universités
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl text-white"
                >
                  Explorer les universités
                </button>
              </div>
            ) : (
              partnerships.filter(p => p.status === 'active').map((partnership, index) => {
                const partner = partnership.university?.name ? partnership.university : partnership.partner
                return (
                  <motion.div
                    key={partnership._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-5 hover:border-cyan-500/60 transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{partner?.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <span>{partner?.location}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Partenariat actif
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition">
                          <MessageCircle className="w-4 h-4 inline mr-1" />
                          Contacter
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition">
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-4 text-center border border-cyan-500/30">
            <Globe className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{universities.length}+</p>
            <p className="text-slate-400 text-sm">Universités partenaires</p>
          </div>
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl p-4 text-center border border-cyan-500/30">
            <Users className="w-8 h-8 text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">2.5M+</p>
            <p className="text-slate-400 text-sm">Étudiants connectés</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 text-center border border-cyan-500/30">
            <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-slate-400 text-sm">Programmes d'échange</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-4 text-center border border-cyan-500/30">
            <TrendingUp className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">45+</p>
            <p className="text-slate-400 text-sm">Pays représentés</p>
          </div>
        </motion.div>
      </div>

      {/* University Details Modal */}
      <AnimatePresence>
        {showDetails && selectedUniversity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-violet-600 p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedUniversity.name}</h2>
                    <p className="text-cyan-200 text-sm">{selectedUniversity.location}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <p className="text-slate-300">{selectedUniversity.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-cyan-400 text-sm">Étudiants</p>
                    <p className="text-white text-xl font-bold">{selectedUniversity.studentsCount?.toLocaleString() || '10,000+'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-cyan-400 text-sm">Programmes</p>
                    <p className="text-white text-xl font-bold">{selectedUniversity.programsCount || 50}+</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-cyan-400 text-sm">Partenariats</p>
                    <p className="text-white text-xl font-bold">{selectedUniversity.partnerships || 0}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-cyan-400 text-sm">Année création</p>
                    <p className="text-white text-xl font-bold">{selectedUniversity.established || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {selectedUniversity.website && (
                    <a
                      href={selectedUniversity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition"
                    >
                      <Globe className="w-4 h-4" />
                      Site web
                    </a>
                  )}
                  {getPartnershipStatus(selectedUniversity._id) !== 'active' && !isPendingRequest(selectedUniversity._id) && (
                    <button
                      onClick={() => {
                        sendPartnershipRequest(selectedUniversity._id)
                        setShowDetails(false)
                      }}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 text-white py-2 rounded-xl font-medium hover:shadow-lg transition"
                    >
                      Demander un partenariat
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}