// app/admin/universities/add/page.tsx - Ajouter une université
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building2, ArrowLeft, Save, Globe, MapPin, Mail, Phone, 
  Link as LinkIcon, Upload, X, CheckCircle, AlertCircle,
  Sparkles, Zap, Shield, GraduationCap, Network
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const continents = [
  "Afrique", "Amérique du Nord", "Amérique du Sud", "Asie", "Europe", "Océanie"
]

export default function AddUniversityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    name_en: "",
    location: "",
    country: "",
    continent: "",
    website: "",
    email: "",
    phone: "",
    description: "",
    address: "",
    postalCode: "",
    logo: null as File | null,
    assignCurrentUserAsAdmin: true,
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le logo ne doit pas dépasser 2MB")
      return
    }
    
    if (!["image/jpeg", "image/png", "image/svg+xml", "image/webp"].includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG, SVG ou WEBP")
      return
    }
    
    setUploadingLogo(true)
    setFormData({ ...formData, logo: file })
    
    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
      setUploadingLogo(false)
    }
    reader.onerror = () => {
      toast.error("Erreur lors du chargement de l'image")
      setUploadingLogo(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.location || !formData.country || !formData.email) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }
    
    setLoading(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("name_en", formData.name_en)
      formDataToSend.append("location", formData.location)
      formDataToSend.append("country", formData.country)
      formDataToSend.append("continent", formData.continent)
      formDataToSend.append("website", formData.website)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("phone", formData.phone)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("address", formData.address)
      formDataToSend.append("postalCode", formData.postalCode)
      formDataToSend.append("assignCurrentUserAsAdmin", String(formData.assignCurrentUserAsAdmin))
      
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo)
      }
      
      const response = await fetch("/api/admin/universities", {
        method: "POST",
        body: formDataToSend,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création")
      }
      
      toast.success("Université créée avec succès !")
      router.push("/admin/universities?created=true")
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "Impossible de créer l'université")
    } finally {
      setLoading(false)
    }
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[oklch(0.16_0.04_270)]">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[oklch(0.14_0.05_265)] via-[oklch(0.16_0.04_270)] to-[oklch(0.12_0.06_260)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,255,255,0.08),transparent)]" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.02]" />
      
      {/* Animated Orbs */}
      <div className="fixed top-40 right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-violet-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Header Hero */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
                <Network className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Nouvel établissement</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Intégrer une université
                </span>
              </h1>
              <p className="text-gray-400 mt-2">Ajoutez un nouvel établissement au réseau GlobeUni</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <motion.div 
              className="lg:col-span-2 space-y-6"
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              {/* Informations générales */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full blur-2xl" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Building2 className="h-5 w-5 text-cyan-400" />
                    Informations générales
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Informations de base sur l'université
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Nom de l'université (Français) *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Université d'Antananarivo"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name_en" className="text-gray-300">Nom de l'université (Anglais)</Label>
                      <Input
                        id="name_en"
                        name="name_en"
                        value={formData.name_en}
                        onChange={handleChange}
                        placeholder="University of Antananarivo"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Présentation de l'université..."
                      rows={4}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Localisation */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    Localisation
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Coordonnées géographiques de l'établissement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-300">Ville *</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Antananarivo"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-gray-300">Pays *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Madagascar"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="continent" className="text-gray-300">Continent *</Label>
                      <Select value={formData.continent} onValueChange={(value) => setFormData({ ...formData, continent: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Sélectionnez le continent" />
                        </SelectTrigger>
                        <SelectContent className="bg-[oklch(0.21_0.045_270)] border-white/10">
                          {continents.map(continent => (
                            <SelectItem key={continent} value={continent} className="text-white hover:bg-white/10">
                              {continent}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-gray-300">Code postal</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="101"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-300">Adresse complète</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="BP 1234, Avenue de l'Indépendance"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Globe className="h-5 w-5 text-cyan-400" />
                    Contact et Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email officiel *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="contact@universite.mg"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-300">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+261 20 22 123 45"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-gray-300">Site web</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="www.universite.mg"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div 
              className="space-y-6"
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              {/* Logo Upload */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <Upload className="h-4 w-4 text-cyan-400" />
                    Logo de l'université
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    {uploadingLogo ? (
                      <div className="w-32 h-32 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : logoPreview ? (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="relative w-32 h-32 object-contain rounded-xl bg-white/10 border border-white/20 p-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, logo: null })
                            setLogoPreview(null)
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer group">
                        <div className="w-32 h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center transition-all group-hover:border-cyan-500/50 group-hover:bg-white/5">
                          <Upload className="h-8 w-8 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                          <span className="text-xs text-gray-500 mt-2 group-hover:text-gray-400">Charger</span>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/svg+xml,image/webp"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    <div className="text-xs text-gray-500 text-center space-y-1">
                      <p>Format: JPG, PNG, SVG, WEBP</p>
                      <p>Taille max: 2MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Assignment */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    Configuration administrateur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.assignCurrentUserAsAdmin}
                      onChange={(e) => setFormData({ ...formData, assignCurrentUserAsAdmin: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-white group-hover:text-cyan-400 transition-colors">
                        M'assigner comme super admin
                      </p>
                      <p className="text-xs text-gray-500">
                        Vous aurez tous les droits sur cette université
                      </p>
                    </div>
                    <Shield className="h-4 w-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </label>
                </CardContent>
              </Card>

              {/* Preview Card */}
              {/* Preview Card - CORRIGÉ */}
<Card className="border-white/15 bg-[oklch(0.21_0.045_270)] backdrop-blur-sm overflow-hidden">
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-white text-base">
      <Sparkles className="h-4 w-4 text-cyan-400" />
      Aperçu
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-white/10">
      <div className="flex items-center gap-3">
        {logoPreview ? (
          <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain rounded-lg bg-white/10 p-1" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-500/30 flex items-center justify-center border border-white/10">
            <Building2 className="h-6 w-6 text-cyan-300" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-white">
            {formData.name || "Nom de l'université"}
          </p>
          <p className="text-sm text-gray-300">
            {formData.location && formData.country 
              ? `${formData.location}, ${formData.country}`
              : "Localisation"}
          </p>
        </div>
        <GraduationCap className="h-8 w-8 text-gray-500/40" />
      </div>
    </div>
  </CardContent>
</Card>

{/* Info Card - CORRIGÉ */}
<Card className="border-cyan-500/30 bg-[oklch(0.19_0.045_270)] backdrop-blur-sm overflow-hidden">
  <CardContent className="pt-6">
    <div className="flex gap-3">
      <div className="p-1.5 rounded-lg bg-cyan-500/20">
        <AlertCircle className="h-4 w-4 text-cyan-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm text-white font-medium">Statut par défaut</p>
        <p className="text-xs text-gray-300 leading-relaxed">
          Les nouvelles universités sont créées avec le statut <span className="text-yellow-400 font-medium">"En attente"</span>. 
          Un administrateur global devra les activer pour qu'elles apparaissent sur la plateforme.
        </p>
      </div>
    </div>
  </CardContent>
</Card>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div 
            className="mt-8 flex justify-end gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
  type="button"
  variant="outline"
  onClick={() => router.back()}
  disabled={loading}
  className="border-white/25 text-white bg-white/5 hover:bg-white/15 hover:border-white/40 transition-all duration-300"
>
  Annuler
</Button>
            <Button
              type="submit"
              disabled={loading || uploadingLogo}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white border-0 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300 px-8"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Créer l'université
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}