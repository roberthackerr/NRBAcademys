"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { 
  GraduationCap, BookOpen, Users, Award, ChevronRight,
  PlayCircle, Star, ShieldCheck, Sparkles, TrendingUp,
  Clock, Globe, Rocket, Brain, Code2, Briefcase,
  CheckCircle2, ArrowRight, Infinity, Zap, Crown,
  MessageCircle, Video, BarChart3, User, LayoutDashboard,
  Network, Radio, Target, Diamond
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/nav"

// Composant pour les animations
const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100 + delay * 150)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

// Section d'accueil personnalisée pour utilisateur connecté
const WelcomeSection = ({ userName }: { userName: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl mb-12"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-violet-600 to-purple-600"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="relative p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Bon retour, {userName.split(' ')[0]}!
              </h2>
            </div>
            <p className="text-cyan-100 mb-6">
              Continuez votre apprentissage là où vous vous êtes arrêté.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button className="bg-white text-violet-600 hover:bg-cyan-50 shadow-lg hover:shadow-cyan-500/25">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Tableau de bord
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Explorer les cours
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-white">Progression</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-cyan-200 mb-1">
                    <span>Objectif de la semaine</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-400 to-violet-400 h-2 rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-cyan-200">
                  <span>🔥 Série : 5 jours</span>
                  <span>🏆 3 cours complétés</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Section Hero
const HeroSection = () => {
  return (
    <div className="text-center relative">
      <Badge variant="secondary" className="mb-6 px-4 py-2 bg-cyan-500/10 border-cyan-500/30 text-cyan-400 backdrop-blur-sm">
        <ShieldCheck className="mr-2 h-4 w-4" />
        +100 000 apprenants nous font confiance
      </Badge>
      
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
        <span className="text-white">Maîtrisez les compétences</span>
        <br />
        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
          du futur
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
        Accédez à +10 000 cours créés par des experts. Apprenez à votre rythme, 
        obtenez des certifications et boostez votre carrière.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <Link href="/signup">
          <Button className="group bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300">
            Commencer gratuitement
            <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/courses">
          <Button variant="outline" className="px-8 py-6 text-lg rounded-xl border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400">
            <PlayCircle className="mr-2 h-5 w-5" />
            Explorer les cours
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const userName = session?.user?.name || "Apprenant"

  const stats = [
    { value: 10000, label: "Cours disponibles", icon: <BookOpen className="h-5 w-5" />, suffix: "+" },
    { value: 500, label: "Experts formateurs", icon: <Users className="h-5 w-5" />, suffix: "+" },
    { value: 2000000, label: "Apprenants", icon: <GraduationCap className="h-5 w-5" />, suffix: "+" },
    { value: 98, label: "Satisfaction", icon: <TrendingUp className="h-5 w-5" />, suffix: "%" },
  ]

  const categories = [
    { name: "Développement Web", count: 245, icon: <Code2 className="h-6 w-6" />, color: "from-cyan-500 to-blue-500" },
    { name: "Intelligence Artificielle", count: 128, icon: <Brain className="h-6 w-6" />, color: "from-violet-500 to-purple-500" },
    { name: "Data Science", count: 189, icon: <BarChart3 className="h-6 w-6" />, color: "from-emerald-500 to-teal-500" },
    { name: "Cybersécurité", count: 76, icon: <ShieldCheck className="h-6 w-6" />, color: "from-red-500 to-orange-500" },
  ]

  const benefits = [
    { title: "Certification reconnue", description: "Certificats valorisés par les recruteurs", icon: <Award className="h-8 w-8" /> },
    { title: "Apprentissage flexible", description: "Accès 24h/24 à votre rythme", icon: <Clock className="h-8 w-8" /> },
    { title: "Support personnalisé", description: "Assistance dédiée et mentorat", icon: <MessageCircle className="h-8 w-8" /> },
    { title: "Projets pratiques", description: "Portfolio professionnel", icon: <Briefcase className="h-8 w-8" /> },
  ]

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 animate-pulse mx-auto mb-4"></div>
          <p className="text-cyan-400/80 font-mono">CHARGEMENT...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] relative overflow-hidden">
      {/* Holographic Grid Background */}
      <Navbar></Navbar>
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0, 255, 255, 0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
      }} />

      {/* Animated Glow Orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>

      {/* Floating Nodes */}
      <div className="fixed top-40 right-20 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-ping pointer-events-none"></div>
      <div className="fixed bottom-40 left-20 w-2 h-2 bg-violet-400 rounded-full shadow-lg shadow-violet-400/50 animate-pulse delay-700 pointer-events-none"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero / Welcome Section */}
        <AnimatedSection delay={0}>
          {isAuthenticated ? <WelcomeSection userName={userName} /> : <HeroSection />}
        </AnimatedSection>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-20">
          {stats.map((stat, index) => (
            <AnimatedSection key={stat.label} delay={index + 1}>
              <Card className="border-cyan-500/20 bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-lg text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* Recommandations personnalisées */}
        {isAuthenticated && (
          <AnimatedSection delay={5}>
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Badge variant="secondary" className="mb-2 px-4 py-1 bg-violet-500/10 text-violet-400 border-violet-500/30">
                    RECOMMANDÉ POUR VOUS
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Cours susceptibles de vous intéresser
                  </h2>
                </div>
                <Link href="/recommendations">
                  <Button variant="ghost" className="group text-cyan-400 hover:text-cyan-300">
                    Voir tout
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, index) => (
                  <Card key={index} className="group overflow-hidden border-cyan-500/20 bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2">
                    <CardContent className="p-6">
                      <div className="p-3 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl w-fit mb-4">
                        {index === 0 ? <Code2 className="h-6 w-6 text-white" /> : 
                         index === 1 ? <Brain className="h-6 w-6 text-white" /> : 
                         <ShieldCheck className="h-6 w-6 text-white" />}
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2">
                        {index === 0 ? "React.js Avancé" : index === 1 ? "IA & Machine Learning" : "Cybersécurité Expert"}
                      </h3>
                      <p className="text-sm text-slate-400 mb-3">Par {index === 0 ? "Jean Dupont" : index === 1 ? "Dr. Martin" : "Prof. Bernard"}</p>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{[15420, 8970, 12350][index].toLocaleString()} étudiants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{["24h", "32h", "40h"][index]}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700">
                        Continuer
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Catégories */}
        <AnimatedSection delay={isAuthenticated ? 8 : 5}>
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1 bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
              CATÉGORIES
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explorez nos domaines d'expertise
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Des cours couvrant les technologies et compétences les plus recherchées
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link key={category.name} href={`/courses?category=${category.name.toLowerCase()}`}>
                <Card className="group cursor-pointer border-cyan-500/20 bg-white/5 backdrop-blur-sm shadow-md hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-gradient-to-br ${category.color} rounded-xl text-white`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-slate-400">{category.count} cours</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </AnimatedSection>

        {/* Avantages */}
        <AnimatedSection delay={isAuthenticated ? 9 : 6}>
          <div className="mt-24">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 px-4 py-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                POURQUOI NOUS CHOISIR
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Une expérience d'apprentissage unique
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour réussir votre formation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={benefit.title} className="h-full border-cyan-500/20 bg-white/5 backdrop-blur-sm shadow-md hover:shadow-cyan-500/10 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-4 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                      {benefit.icon}
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-2">{benefit.title}</h3>
                    <p className="text-slate-400 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection delay={isAuthenticated ? 10 : 7}>
          <div className="mt-24 relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-violet-600 to-purple-600"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative p-8 md:p-12 lg:p-16 text-center">
              <div className="max-w-3xl mx-auto">
                {!isAuthenticated ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-white">Offre limitée</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                      Prêt à commencer votre voyage ?
                    </h2>
                    <p className="text-cyan-100 mb-8 text-lg md:text-xl">
                      Rejoignez plus de 2 millions d'apprenants
                    </p>
                    <Link href="/signup">
                      <Button className="bg-white text-violet-600 hover:bg-cyan-50 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all">
                        Commencer gratuitement
                        <Sparkles className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                      Continuez votre progression !
                    </h2>
                    <p className="text-cyan-100 mb-8 text-lg md:text-xl">
                      De nouveaux cours vous attendent
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/dashboard">
                        <Button className="bg-white text-violet-600 hover:bg-cyan-50 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all">
                          Accéder au tableau de bord
                          <LayoutDashboard className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/courses">
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                          Explorer les cours
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-cyan-200">
                  <div className="flex items-center gap-2">
                    <Infinity className="h-4 w-4" />
                    Accès à vie
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Certificat inclus
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Communauté active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  )
}