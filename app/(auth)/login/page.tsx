// app/login/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Mail, Lock, ChevronRight, Shield, Sparkles, 
  Network, Radio, Eye, EyeOff, AlertCircle,
  Fingerprint, Building2, Globe, Zap, Award
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email ou mot de passe incorrect")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl"></div>

      {/* Floating Nodes */}
      <div className="absolute top-40 right-20 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-ping"></div>
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-violet-400 rounded-full shadow-lg shadow-violet-400/50 animate-pulse delay-700"></div>
      <div className="absolute top-60 left-1/4 w-1 h-1 bg-cyan-300 rounded-full"></div>
      <div className="absolute bottom-60 right-1/4 w-1 h-1 bg-violet-300 rounded-full"></div>

      <div className="max-w-md mx-auto relative z-10 px-4 py-8 min-h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full"
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
              
              <div className="mt-2">
                <span className="text-xs font-mono text-cyan-400/60 tracking-wider">ACCÈS PLATEFORME</span>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mt-2 tracking-tight">
                  Connexion
                </h1>
                <p className="text-cyan-100/50 text-sm mt-1">
                  Accédez à votre espace d'apprentissage
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    ADRESSE EMAIL
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400/50" />
                    <Input
                      type="email"
                      placeholder="jean.dupont@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      MOT DE PASSE
                    </Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors font-mono"
                    >
                      MOT DE PASSE OUBLIÉ ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400/50" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400/50 hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Biometric Option (Demo) */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cyan-500/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-transparent text-cyan-400/50 font-mono">OU</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-cyan-100 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                  onClick={() => toast("Connexion biométrique bientôt disponible")}
                >
                  <Fingerprint className="h-5 w-5" />
                  <span className="text-sm font-medium">Connexion biométrique</span>
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>CONNEXION EN COURS...</span>
                  </div>
                ) : (
                  <>
                    <span>SE CONNECTER</span>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="pt-4 border-t border-cyan-500/20">
                <p className="text-center text-sm text-slate-400">
                  Pas encore de compte ?{" "}
                  <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    CRÉER UN COMPTE
                  </Link>
                </p>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500 font-mono">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-cyan-400" />
                    <span>DONNÉES CHIFFRÉES</span>
                  </div>
                  <div className="w-1 h-1 bg-cyan-500/50 rounded-full" />
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-violet-400" />
                    <span>RÉSEAU MONDIAL</span>
                  </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <p className="text-xs text-cyan-400/70 text-center font-mono mb-2">COMPTE DE DÉMONSTRATION</p>
                  <div className="flex justify-center gap-4 text-xs text-slate-400">
                    <span>Email: demo@nexus.edu</span>
                    <span>Mot de passe: demo123</span>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-500/20 bg-cyan-950/10">
              <div className="flex items-center justify-between text-xs text-cyan-400/50 font-mono">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  <span>© 2024 NEXUS ACADÉMIQUE</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  <span>RÉSEAU MONDIAL</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Helper function for toast (you may need to import from sonner)
function toast(message: string) {
  console.log(message)
}