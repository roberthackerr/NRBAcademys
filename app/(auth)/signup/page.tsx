// app/signup/page.tsx - Step 1/3 (Personal Information)
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { 
  User, Mail, Lock, MapPin, Cake, Globe, ChevronRight, 
  Shield, Sparkles, Building2, Calendar, Phone, 
  CheckCircle2, AlertCircle, Network, Radio, Award
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SignupStep1() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    birthDate: "",
    address: "",
    city: "",
    country: "Madagascar",
    phone: "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
    
    // Check password strength
    if (name === "password") {
      calculatePasswordStrength(value)
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field)
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    setPasswordStrength(strength)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-slate-700"
    if (passwordStrength === 1) return "bg-red-500"
    if (passwordStrength === 2) return "bg-orange-500"
    if (passwordStrength === 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Très faible"
    if (passwordStrength === 1) return "Faible"
    if (passwordStrength === 2) return "Moyen"
    if (passwordStrength === 3) return "Fort"
    return "Très fort"
  }

  const validateField = (field: string) => {
    let error = ""
    
    switch (field) {
      case "name":
        if (!formData.name.trim()) error = "Le nom complet est requis"
        else if (formData.name.length < 2) error = "Nom trop court"
        break
      case "email":
        if (!formData.email) error = "L'email est requis"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) error = "Email invalide"
        break
      case "password":
        if (!formData.password) error = "Le mot de passe est requis"
        else if (formData.password.length < 8) error = "Minimum 8 caractères"
        break
      case "confirmPassword":
        if (formData.password !== formData.confirmPassword) error = "Les mots de passe ne correspondent pas"
        break
      case "birthDate":
        if (!formData.birthDate) error = "La date de naissance est requise"
        else {
          const birthDate = new Date(formData.birthDate)
          const age = new Date().getFullYear() - birthDate.getFullYear()
          if (age < 16) error = "Vous devez avoir au moins 16 ans"
        }
        break
    }
    
    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }

  const validateForm = () => {
    const fields = ["name", "email", "password", "confirmPassword", "birthDate"]
    let isValid = true
    
    fields.forEach(field => {
      if (!validateField(field)) isValid = false
    })
    
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      sessionStorage.setItem("signupData", JSON.stringify(formData))
      router.push("/signup/step2")
    } catch (err) {
      setErrors({ general: "Une erreur est survenue. Veuillez réessayer." })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.name && formData.email && formData.password && 
                      formData.confirmPassword && formData.birthDate &&
                      Object.keys(errors).filter(k => errors[k]).length === 0

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
      <div className="absolute top-60 left-1/3 w-1 h-1 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/50"></div>
      <div className="absolute bottom-60 right-1/3 w-1 h-1 bg-violet-300 rounded-full shadow-lg shadow-violet-300/50"></div>

      <div className="max-w-2xl mx-auto relative z-10 px-4 py-8">
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
              
              <Progress value={33} className="h-1 bg-cyan-500/20" />
              
              <div className="mt-4">
                <span className="text-xs font-mono text-cyan-400/60 tracking-wider">ÉTAPE 01 — IDENTITÉ NUMÉRIQUE</span>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mt-2 tracking-tight">
                  Créer votre compte
                </h1>
                <p className="text-cyan-100/50 text-sm mt-1">
                  Rejoignez le réseau éducatif mondial
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* General Error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.general}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <User className="h-3 w-3" />
                    IDENTITÉ COMPLÈTE
                  </Label>
                  <Input
                    name="name"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    className={`bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                      errors.name && touched.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && touched.name && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    ADRESSE EMAIL
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="jean.dupont@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    className={`bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                      errors.email && touched.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && touched.email && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    TÉLÉPHONE (OPTIONNEL)
                  </Label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+261 34 12 345 67"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <Award className="h-3 w-3" />
                    STATUT
                  </Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-400 transition-all cursor-pointer flex-1">
                      <RadioGroupItem value="student" id="student" className="border-cyan-400" />
                      <Label htmlFor="student" className="cursor-pointer text-cyan-100 font-normal text-sm">
                        🎓 Étudiant
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-400 transition-all cursor-pointer flex-1">
                      <RadioGroupItem value="instructor" id="instructor" className="border-cyan-400" />
                      <Label htmlFor="instructor" className="cursor-pointer text-cyan-100 font-normal text-sm">
                        👨‍🏫 Enseignant
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Birth Date */}
                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      DATE DE NAISSANCE
                    </Label>
                    <Input
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      onBlur={() => handleBlur("birthDate")}
                      className={`bg-cyan-950/20 border-cyan-500/30 text-cyan-100 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                        errors.birthDate && touched.birthDate ? "border-red-500" : ""
                      }`}
                      max={new Date().toISOString().split('T')[0]}
                      min="1900-01-01"
                    />
                    {errors.birthDate && touched.birthDate && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.birthDate}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      PAYS
                    </Label>
                    <Input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    ADRESSE (OPTIONNEL)
                  </Label>
                  <Input
                    name="address"
                    placeholder="123 rue Example"
                    value={formData.address}
                    onChange={handleChange}
                    className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider">
                    VILLE (OPTIONNEL)
                  </Label>
                  <Input
                    name="city"
                    placeholder="Antananarivo"
                    value={formData.city}
                    onChange={handleChange}
                    className="bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    MOT DE PASSE
                  </Label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    className={`bg-cyan-950/20 border-cyan-500/30 text-cyan-100 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                      errors.password && touched.password ? "border-red-500" : ""
                    }`}
                  />
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i < passwordStrength ? getPasswordStrengthColor() : "bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        Force: <span className={getPasswordStrengthColor().replace("bg-", "text-")}>
                          {getPasswordStrengthText()}
                        </span>
                      </p>
                    </div>
                  )}
                  {errors.password && touched.password && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    CONFIRMER LE MOT DE PASSE
                  </Label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`bg-cyan-950/20 border-cyan-500/30 text-cyan-100 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                      errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>INITIALISATION...</span>
                    </div>
                  ) : (
                    <>
                      <span>CONTINUER VERS LE PARCOURS</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Footer Links */}
              <div className="pt-4 border-t border-cyan-500/20">
                <p className="text-center text-sm text-slate-400">
                  Déjà un compte ?{" "}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    SE CONNECTER
                  </Link>
                </p>

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
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}