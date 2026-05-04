"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Mail, ChevronRight, Shield, Sparkles, 
  Network, Radio, ArrowLeft, AlertCircle,
  CheckCircle2, Building2, Globe, Lock
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simulation d'envoi
    setTimeout(() => {
      if (email && email.includes("@")) {
        setSent(true)
      } else {
        setError("Email invalide")
      }
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0, 255, 255, 0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
      }} />
      
      <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="max-w-md mx-auto relative z-10 px-4 py-8 min-h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className="backdrop-blur-xl bg-white/5 border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-cyan-500/20">
              <div className="flex justify-between items-center mb-4">
                <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-lg opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-cyan-500 to-violet-600 p-2 rounded-xl">
                      <Network className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    NEXUS ACADÉMIQUE
                  </span>
                </motion.div>
                <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
                  <Radio className="h-3 w-3" />
                  <span>RÉCUPÉRATION</span>
                </div>
              </div>
              
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-cyan-400/70 hover:text-cyan-400 transition-colors mb-4">
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
              
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mt-2">
                Mot de passe oublié ?
              </h1>
              <p className="text-cyan-100/50 text-sm mt-1">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {!sent ? (
                <>
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>ENVOI EN COURS...</span>
                      </div>
                    ) : (
                      <>
                        <span>ENVOYER LE LIEN</span>
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 text-center"
                >
                  <div className="flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Email envoyé !</h3>
                  <p className="text-sm text-slate-400">
                    Un lien de réinitialisation a été envoyé à <span className="text-cyan-400">{email}</span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSent(false)}
                    className="mt-4 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    Renvoyer le lien
                  </Button>
                </motion.div>
              )}

              <div className="pt-4 border-t border-cyan-500/20">
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-mono">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-cyan-400" />
                    <span>DONNÉES CHIFFRÉES</span>
                  </div>
                  <div className="w-1 h-1 bg-cyan-500/50 rounded-full" />
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-violet-400" />
                    <span>SÉCURISÉ</span>
                  </div>
                </div>
              </div>
            </form>

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