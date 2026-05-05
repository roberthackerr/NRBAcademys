// app/signup/step3/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, Building2, GraduationCap, BookOpen, Calendar, 
  MapPin, Mail, User, Sparkles, Globe, Shield, Award, 
  ArrowRight, Download, Share2, Network, Radio, 
  Rocket, Target, Zap, Users, TrendingUp, Clock, Brain,
  CheckCircle2, Star, Crown, Diamond
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SignupStep3() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const success = searchParams.get("success")
    if (success !== "true") {
      router.push("/signup")
      return
    }

    // ✅ Vérifier si on est côté client avant d'utiliser sessionStorage
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem("signupData")
      if (storedData) {
        setUserData(JSON.parse(storedData))
      }
    }
    
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    setLoading(false)
    
    return () => clearInterval(timer)
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-cyan-400/80 mt-4 font-mono text-sm tracking-wider">
            FINALISATION DE L'INSCRIPTION...
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

      {/* Floating Particles */}
      <div className="absolute top-40 right-20 w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 animate-ping"></div>
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-pulse delay-700"></div>
      <div className="absolute top-60 left-1/4 w-1 h-1 bg-violet-300 rounded-full"></div>
      <div className="absolute bottom-60 right-1/4 w-1 h-1 bg-emerald-300 rounded-full"></div>

      <div className="max-w-3xl mx-auto relative z-10 px-4 py-8">
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
                    <div className="absolute inset-0 bg-emerald-400 rounded-xl blur-lg opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 rounded-xl">
                      <Network className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                    NEXUS ACADÉMIQUE
                  </span>
                </motion.div>
                <div className="flex items-center gap-2 text-xs text-emerald-400/70 font-mono">
                  <Radio className="h-3 w-3" />
                  <span>INSCRIPTION COMPLÈTE</span>
                </div>
              </div>
              
              <Progress value={100} className="h-1 bg-cyan-500/20" />
              
              <div className="mt-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="flex justify-center mb-4"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <span className="text-xs font-mono text-emerald-400/60 tracking-wider">ÉTAPE 03 — CONFIRMATION</span>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mt-2 tracking-tight">
                  Inscription confirmée !
                </h1>
                <p className="text-cyan-100/50 text-sm mt-1">
                  Bienvenue dans la communauté éducative mondiale
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/30 text-center"
              >
                <p className="text-emerald-400 text-sm">
                  ✓ Votre compte a été créé avec succès. Redirection automatique dans {countdown} secondes...
                </p>
              </motion.div>

              {/* User Summary - with fallback values */}
              {userData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <h3 className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <User className="h-3 w-3" />
                    IDENTITÉ NUMÉRIQUE
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                      <span className="text-xs text-cyan-400/70">NOM COMPLET</span>
                      <p className="font-medium text-cyan-100 mt-1">{userData?.name || "Non renseigné"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                      <span className="text-xs text-cyan-400/70">EMAIL</span>
                      <p className="font-medium text-cyan-100 mt-1">{userData?.email || "Non renseigné"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                      <span className="text-xs text-cyan-400/70">STATUT</span>
                      <p className="font-medium text-cyan-100 mt-1 capitalize">{userData?.role || "Étudiant"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                      <span className="text-xs text-cyan-400/70">LOCALISATION</span>
                      <p className="font-medium text-cyan-100 mt-1">{userData?.city || userData?.country || "Non renseignée"}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Next Steps */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                  <Target className="h-3 w-3" />
                  PROCHAINES ÉTAPES
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: User, title: "Complétez votre profil", desc: "Ajoutez une photo, votre bio et vos compétences", color: "cyan" },
                    { icon: BookOpen, title: "Explorez les cours", desc: "Découvrez les formations de votre université", color: "violet" },
                    { icon: Users, title: "Connectez-vous", desc: "Rejoignez des groupes d'étude et des forums", color: "emerald" }
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-violet-500/5 border border-cyan-500/20 hover:border-cyan-400 transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-cyan-100 flex items-center gap-2">
                          <step.icon className={`h-4 w-4 text-${step.color}-400`} />
                          {step.title}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">{step.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Global Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  RÉSEAU MONDIAL
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Building2, value: "50+", label: "Universités", color: "cyan" },
                    { icon: Users, value: "10k+", label: "Étudiants", color: "violet" },
                    { icon: BookOpen, value: "500+", label: "Cours", color: "emerald" },
                    { icon: Globe, value: "30+", label: "Pays", color: "amber" }
                  ].map((stat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/5 to-violet-500/5 border border-cyan-500/20 text-center hover:border-cyan-400 transition-all">
                      <stat.icon className={`h-6 w-6 text-${stat.color}-400 mx-auto mb-2`} />
                      <div className="text-xl font-bold text-cyan-100">{stat.value}</div>
                      <div className="text-xs text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-3 pt-4"
              >
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                >
                  ACCÉDER AU TABLEAU DE BORD
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/profile")}
                  className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all"
                >
                  COMPLÉTER MON PROFIL
                </Button>
              </motion.div>

              {/* Additional Actions */}
              <div className="flex justify-center gap-6 pt-4">
                <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors font-mono">
                  <Download className="h-3 w-3" />
                  TÉLÉCHARGER LA CONFIRMATION
                </button>
                <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors font-mono">
                  <Share2 className="h-3 w-3" />
                  PARTAGER
                </button>
              </div>

              {/* Footer Message */}
              <div className="text-center pt-4 border-t border-cyan-500/20">
                <p className="text-xs text-slate-500 font-mono">
                  Un email de confirmation a été envoyé à votre adresse.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Besoin d'aide ?{" "}
                  <Link href="/support" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    CONTACTER LE SUPPORT
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="p-4 border-t border-cyan-500/20 bg-cyan-950/10">
              <div className="flex items-center justify-between text-xs text-cyan-400/50 font-mono">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span>COMPTE VÉRIFIÉ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-emerald-400" />
                  <span>MEMBRE PREMIUM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  <span>ACCÈS IMMÉDIAT</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}