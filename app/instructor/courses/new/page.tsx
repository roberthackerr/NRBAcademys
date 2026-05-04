"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Eye,
  Globe,
  DollarSign,
  Users,
  BookOpen,
  Target,
  X,
  Move,
  FileQuestion,
  FileCheck,
  ListChecks,
  Copy,
  ExternalLink,
  Loader2,
  Menu,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown as ChevronDownIcon,
  Home,
  LayoutDashboard,
  GraduationCap,
  HelpCircle,
  LifeBuoy,
  CreditCard,
  Sparkles,
  Zap,
  BarChart3,
  Microscope,
  Scale,
  Landmark,
  Stethoscope,
  Palette,
  Music,
  History,
  Globe2,
  Brain,
  Calculator,
  Mic,
  BookMarked,
  FlaskConical,
  Binary,
  Languages,
  Church,
  Bike,
  Dumbbell
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

// Import dynamique de TipTapEditor
const TipTapEditor = dynamic(
  () => import("@/components/ui/tiptap-editor").then((mod) => mod.TipTapEditor),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" /> }
)

// Types
interface MediaFile {
  id: string
  name: string
  url: string
  type: "video" | "image" | "document" | "link" | "audio"
  size?: number
  duration?: number
}

interface Lesson {
  id: string
  title: string
  description: string
  type: "video" | "text" | "quiz" | "assignment" | "resource" | "discussion" | "live"
  content: string
  duration: number
  order: number
  isPublished: boolean
  mediaFiles?: MediaFile[]
  readings?: string[]
  bibliography?: string[]
}

interface Section {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

interface CourseData {
  title: string
  subtitle: string
  description: string
  faculty: string
  department: string
  level: "L1" | "L2" | "L3" | "M1" | "M2" | "Doctorat"
  semester: "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10"
  credits: number
  language: string
  price: number
  isFree: boolean
  thumbnail: string
  trailerVideo?: string
  objectives: string[]
  requirements: string[]
  targetAudience: string[]
  sections: Section[]
  featured: boolean
  published: boolean
  tags: string[]
  professor?: string
  teachingAssistant?: string
}

// Facultés universitaires
const faculties = [
  { value: "sciences", label: "Faculté des Sciences", icon: <FlaskConical className="h-4 w-4" />, color: "bg-blue-100 text-blue-700" },
  { value: "lettres", label: "Faculté des Lettres et Sciences Humaines", icon: <BookMarked className="h-4 w-4" />, color: "bg-purple-100 text-purple-700" },
  { value: "droit", label: "Faculté de Droit et Science Politique", icon: <Scale className="h-4 w-4" />, color: "bg-red-100 text-red-700" },
  { value: "economie", label: "Faculté des Sciences Économiques et de Gestion", icon: <Landmark className="h-4 w-4" />, color: "bg-green-100 text-green-700" },
  { value: "medecine", label: "Faculté de Médecine", icon: <Stethoscope className="h-4 w-4" />, color: "bg-rose-100 text-rose-700" },
  { value: "pharmacie", label: "Faculté de Pharmacie", icon: <FlaskConical className="h-4 w-4" />, color: "bg-emerald-100 text-emerald-700" },
  { value: "odontologie", label: "Faculté d'Odontologie", icon: <Stethoscope className="h-4 w-4" />, color: "bg-teal-100 text-teal-700" },
  { value: "ingenierie", label: "École d'Ingénieurs", icon: <Binary className="h-4 w-4" />, color: "bg-indigo-100 text-indigo-700" },
  { value: "arts", label: "Faculté des Arts", icon: <Palette className="h-4 w-4" />, color: "bg-pink-100 text-pink-700" },
  { value: "sport", label: "Faculté des Sciences du Sport", icon: <Dumbbell className="h-4 w-4" />, color: "bg-orange-100 text-orange-700" },
]

// Départements par faculté
const departmentsByFaculty: Record<string, { value: string; label: string; icon: React.ReactNode }[]> = {
  sciences: [
    { value: "math", label: "Mathématiques", icon: <Calculator className="h-4 w-4" /> },
    { value: "physique", label: "Physique", icon: <Microscope className="h-4 w-4" /> },
    { value: "chimie", label: "Chimie", icon: <FlaskConical className="h-4 w-4" /> },
    { value: "biologie", label: "Biologie", icon: <Microscope className="h-4 w-4" /> },
    { value: "informatique", label: "Informatique", icon: <Binary className="h-4 w-4" /> },
    { value: "geologie", label: "Géologie", icon: <Globe2 className="h-4 w-4" /> },
  ],
  lettres: [
    { value: "philosophie", label: "Philosophie", icon: <Brain className="h-4 w-4" /> },
    { value: "histoire", label: "Histoire", icon: <History className="h-4 w-4" /> },
    { value: "geographie", label: "Géographie", icon: <Globe2 className="h-4 w-4" /> },
    { value: "linguistique", label: "Linguistique", icon: <Languages className="h-4 w-4" /> },
    { value: "sociologie", label: "Sociologie", icon: <Users className="h-4 w-4" /> },
    { value: "psychologie", label: "Psychologie", icon: <Brain className="h-4 w-4" /> },
  ],
  droit: [
    { value: "droit-public", label: "Droit Public", icon: <Scale className="h-4 w-4" /> },
    { value: "droit-prive", label: "Droit Privé", icon: <Scale className="h-4 w-4" /> },
    { value: "science-politique", label: "Science Politique", icon: <Landmark className="h-4 w-4" /> },
  ],
  economie: [
    { value: "economie", label: "Économie", icon: <Landmark className="h-4 w-4" /> },
    { value: "gestion", label: "Gestion", icon: <BarChart3 className="h-4 w-4" /> },
    { value: "finance", label: "Finance", icon: <CreditCard className="h-4 w-4" /> },
    { value: "marketing", label: "Marketing", icon: <BarChart3 className="h-4 w-4" /> },
  ],
  medecine: [
    { value: "medecine-generale", label: "Médecine Générale", icon: <Stethoscope className="h-4 w-4" /> },
    { value: "chirurgie", label: "Chirurgie", icon: <Stethoscope className="h-4 w-4" /> },
    { value: "pediatrie", label: "Pédiatrie", icon: <Stethoscope className="h-4 w-4" /> },
    { value: "cardiologie", label: "Cardiologie", icon: <Stethoscope className="h-4 w-4" /> },
  ],
}

// Niveaux universitaires
const levels = [
  { value: "L1", label: "Licence 1", credits: 30, icon: "📚" },
  { value: "L2", label: "Licence 2", credits: 30, icon: "📖" },
  { value: "L3", label: "Licence 3", credits: 30, icon: "🎓" },
  { value: "M1", label: "Master 1", credits: 30, icon: "🏫" },
  { value: "M2", label: "Master 2", credits: 30, icon: "🎓" },
  { value: "Doctorat", label: "Doctorat", credits: 180, icon: "👨‍🏫" },
]

// Semestres
const semesters = [
  { value: "S1", label: "Semestre 1" },
  { value: "S2", label: "Semestre 2" },
  { value: "S3", label: "Semestre 3" },
  { value: "S4", label: "Semestre 4" },
  { value: "S5", label: "Semestre 5" },
  { value: "S6", label: "Semestre 6" },
  { value: "S7", label: "Semestre 7" },
  { value: "S8", label: "Semestre 8" },
  { value: "S9", label: "Semestre 9" },
  { value: "S10", label: "Semestre 10" },
]

// Langues d'enseignement
const languages = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "Anglais", flag: "🇬🇧" },
  { value: "ar", label: "Arabe", flag: "🇸🇦" },
  { value: "mg", label: "Malgache", flag: "🇲🇬" },
  { value: "es", label: "Espagnol", flag: "🇪🇸" },
  { value: "de", label: "Allemand", flag: "🇩🇪" },
]

// Composant d'upload de fichiers
function MediaUploader({ onFileAdd, isVideo = false }: { onFileAdd: (file: any) => void; isVideo?: boolean }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const fileData = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          url: reader.result as string,
          type: file.type.startsWith('video/') ? 'video' : 
                file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('audio/') ? 'audio' : 'document',
          size: file.size,
        }
        onFileAdd(fileData)
      }
      reader.readAsDataURL(file)
    }
    setUploading(false)
  }

  const acceptedTypes = isVideo ? "video/*" : "video/*,image/*,audio/*,application/pdf,.doc,.docx,.ppt,.pptx"

  return (
    <div className="space-y-2">
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <Upload className="h-6 w-6 text-gray-500 group-hover:text-blue-600" />
        </div>
        <p className="text-sm text-gray-600 mt-2">Cliquez pour ajouter des fichiers</p>
        <p className="text-xs text-gray-400">Vidéos, audios, images, PDF, documents (Max 50MB)</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Téléchargement en cours...
        </div>
      )}
    </div>
  )
}

// Composant de gestion des médias
function MediaManager({ files, onRemove, onCopyLink }: { 
  files: MediaFile[]; 
  onRemove: (id: string) => void; 
  onCopyLink: (url: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5 text-blue-500" />
      case 'image': return <ImageIcon className="h-5 w-5 text-green-500" />
      case 'audio': return <Mic className="h-5 w-5 text-purple-500" />
      case 'document': return <FileText className="h-5 w-5 text-orange-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getFileIcon(file.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            {(file.type === 'video' || file.type === 'audio') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewUrl(file.url)}
                className="h-7 w-7"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCopyLink(file.url)}
              className="h-7 w-7"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(file.id)}
              className="h-7 w-7 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}

      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewUrl(null)}>
          <div className="max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {previewUrl.includes('video') ? (
              <video src={previewUrl} controls className="w-full rounded-lg" autoPlay />
            ) : (
              <audio src={previewUrl} controls className="w-full" autoPlay />
            )}
            <Button variant="outline" className="mt-4 mx-auto block bg-white" onClick={() => setPreviewUrl(null)}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Composant LessonEditor
function LessonEditor({ lesson, sectionId, onUpdate, onDelete }: {
  lesson: Lesson
  sectionId: string
  onUpdate: (sectionId: string, lessonId: string, updates: Partial<Lesson>) => void
  onDelete: (sectionId: string, lessonId: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMediaUploader, setShowMediaUploader] = useState(false)
  const [newReading, setNewReading] = useState("")

  const handleAddMedia = (file: any) => {
    const newMedia = [...(lesson.mediaFiles || []), file]
    onUpdate(sectionId, lesson.id, { mediaFiles: newMedia })
    setShowMediaUploader(false)
  }

  const handleRemoveMedia = (id: string) => {
    const newMedia = (lesson.mediaFiles || []).filter(m => m.id !== id)
    onUpdate(sectionId, lesson.id, { mediaFiles: newMedia })
  }

  const handleAddReading = () => {
    if (newReading.trim()) {
      const newReadings = [...(lesson.readings || []), newReading.trim()]
      onUpdate(sectionId, lesson.id, { readings: newReadings })
      setNewReading("")
    }
  }

  const handleRemoveReading = (index: number) => {
    const newReadings = (lesson.readings || []).filter((_, i) => i !== index)
    onUpdate(sectionId, lesson.id, { readings: newReadings })
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return "🎥"
      case 'text': return "📝"
      case 'quiz': return "❓"
      case 'assignment': return "📋"
      case 'resource': return "📚"
      case 'discussion': return "💬"
      case 'live': return "🔴"
      default: return "📄"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return "Cours vidéo"
      case 'text': return "Cours texte"
      case 'quiz': return "Quiz / Évaluation"
      case 'assignment': return "Travail à rendre"
      case 'resource': return "Ressource pédagogique"
      case 'discussion': return "Forum de discussion"
      case 'live': return "Cours en direct"
      default: return "Leçon"
    }
  }

  return (
    <div className="border rounded-lg bg-white hover:shadow-md transition-all">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          <Move className="h-4 w-4 text-gray-400 cursor-move" />
          <span className="text-lg">{getTypeIcon(lesson.type)}</span>
          <Input
            value={lesson.title}
            onChange={(e) => onUpdate(sectionId, lesson.id, { title: e.target.value })}
            className="border-0 bg-transparent focus-visible:ring-0 px-0 font-medium"
            placeholder="Titre de la leçon"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {lesson.duration} min
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getTypeLabel(lesson.type)}
          </Badge>
          {lesson.isPublished && (
            <Badge className="bg-green-100 text-green-700 text-xs">Publié</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(sectionId, lesson.id)
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type de leçon</Label>
              <Select
                value={lesson.type}
                onValueChange={(v: any) => onUpdate(sectionId, lesson.id, { type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">🎥 Cours vidéo</SelectItem>
                  <SelectItem value="text">📝 Cours texte</SelectItem>
                  <SelectItem value="quiz">❓ Quiz / Évaluation</SelectItem>
                  <SelectItem value="assignment">📋 Travail à rendre</SelectItem>
                  <SelectItem value="resource">📚 Ressource pédagogique</SelectItem>
                  <SelectItem value="discussion">💬 Forum de discussion</SelectItem>
                  <SelectItem value="live">🔴 Cours en direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durée estimée (minutes)</Label>
              <Input
                type="number"
                value={lesson.duration}
                onChange={(e) => onUpdate(sectionId, lesson.id, { duration: parseInt(e.target.value) || 0 })}
                placeholder="45"
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={lesson.isPublished}
                  onCheckedChange={(checked) => onUpdate(sectionId, lesson.id, { isPublished: checked })}
                />
                <span className="text-sm text-gray-600">
                  {lesson.isPublished ? "Publié" : "Brouillon"}
                </span>
              </div>
            </div>
          </div>

          {/* Médias pour vidéos et ressources */}
          {(lesson.type === 'video' || lesson.type === 'resource' || lesson.type === 'live') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {lesson.type === 'video' ? '🎥 Contenu vidéo' : '📚 Documents et ressources'}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMediaUploader(!showMediaUploader)}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Ajouter un fichier
                </Button>
              </div>

              {showMediaUploader && (
                <MediaUploader onFileAdd={handleAddMedia} isVideo={lesson.type === 'video'} />
              )}

              {lesson.mediaFiles && lesson.mediaFiles.length > 0 && (
                <MediaManager 
                  files={lesson.mediaFiles} 
                  onRemove={handleRemoveMedia}
                  onCopyLink={handleCopyLink}
                />
              )}
            </div>
          )}

          {/* Bibliographie / Lectures recommandées */}
          {(lesson.type === 'text' || lesson.type === 'resource') && (
            <div className="space-y-3">
              <Label>Lectures recommandées</Label>
              <div className="space-y-2">
                {lesson.readings?.map((reading, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <BookMarked className="h-4 w-4 text-blue-500" />
                    <span className="flex-1 text-sm">{reading}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveReading(index)}
                      className="h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newReading}
                  onChange={(e) => setNewReading(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddReading()}
                  placeholder="Ajouter une référence bibliographique"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddReading} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Contenu texte */}
          <div className="space-y-2">
            <Label>Contenu de la leçon</Label>
            <TipTapEditor
              value={lesson.content}
              onChange={(value) => onUpdate(sectionId, lesson.id, { content: value })}
              placeholder="Rédigez le contenu de votre leçon..."
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const duplicatedLesson = { 
                  ...lesson, 
                  id: Date.now().toString(), 
                  title: `${lesson.title} (copie)`,
                  isPublished: false
                }
                onUpdate(sectionId, lesson.id, duplicatedLesson)
              }}
              className="gap-1"
            >
              <Copy className="h-4 w-4" />
              Dupliquer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/preview/${lesson.id}`, "_blank")}
              className="gap-1"
            >
              <Eye className="h-4 w-4" />
              Aperçu
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateCoursePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    subtitle: "",
    description: "",
    faculty: "",
    department: "",
    level: "L1",
    semester: "S1",
    credits: 30,
    language: "fr",
    price: 0,
    isFree: false,
    thumbnail: "",
    trailerVideo: "",
    objectives: [],
    requirements: [],
    targetAudience: [],
    sections: [],
    featured: false,
    published: false,
    tags: [],
    professor: session?.user?.name,
  })

  const [newObjective, setNewObjective] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newTag, setNewTag] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check authorization
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && (session?.user as any)?.role !== "instructor") {
      router.push("/student/dashboard")
    }
  }, [status, router, session])

  const handleChange = (field: keyof CourseData, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }))
  }

  const handleFacultyChange = (faculty: string) => {
    setSelectedFaculty(faculty)
    handleChange("faculty", faculty)
    handleChange("department", "")
  }

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      handleChange("objectives", [...courseData.objectives, newObjective.trim()])
      setNewObjective("")
    }
  }

  const handleRemoveObjective = (index: number) => {
    handleChange("objectives", courseData.objectives.filter((_, i) => i !== index))
  }

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      handleChange("requirements", [...courseData.requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const handleRemoveRequirement = (index: number) => {
    handleChange("requirements", courseData.requirements.filter((_, i) => i !== index))
  }

  const handleAddTarget = () => {
    if (newTarget.trim()) {
      handleChange("targetAudience", [...courseData.targetAudience, newTarget.trim()])
      setNewTarget("")
    }
  }

  const handleRemoveTarget = (index: number) => {
    handleChange("targetAudience", courseData.targetAudience.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      handleChange("tags", [...courseData.tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    handleChange("tags", courseData.tags.filter(t => t !== tag))
  }

  const handleThumbnailUpload = async (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      handleChange("thumbnail", reader.result as string)
      showToast("Image téléchargée avec succès", "success")
    }
    reader.readAsDataURL(file)
  }

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: `Chapitre ${courseData.sections.length + 1}`,
      description: "",
      order: courseData.sections.length,
      lessons: []
    }
    handleChange("sections", [...courseData.sections, newSection])
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    handleChange("sections", courseData.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ))
  }

  const deleteSection = (sectionId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce chapitre ?")) {
      handleChange("sections", courseData.sections.filter(s => s.id !== sectionId))
    }
  }

  const addLesson = (sectionId: string) => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: "Nouvelle leçon",
      description: "",
      type: "text",
      content: "",
      duration: 0,
      order: 0,
      isPublished: false,
      mediaFiles: [],
      readings: [],
    }
    handleChange("sections", courseData.sections.map(section =>
      section.id === sectionId
        ? { ...section, lessons: [...section.lessons, newLesson] }
        : section
    ))
  }

  const updateLesson = (sectionId: string, lessonId: string, updates: Partial<Lesson>) => {
    handleChange("sections", courseData.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, ...updates } : lesson
            )
          }
        : section
    ))
  }

  const deleteLesson = (sectionId: string, lessonId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette leçon ?")) {
      handleChange("sections", courseData.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.filter(l => l.id !== lessonId)
            }
          : section
      ))
    }
  }

  const calculateCompletion = () => {
    const fields = [
      courseData.title,
      courseData.description,
      courseData.faculty,
      courseData.department,
      courseData.thumbnail,
      courseData.objectives.length > 0,
      courseData.sections.length > 0 && courseData.sections.some(s => s.lessons.length > 0)
    ]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }

  const handleSubmit = async () => {
    if (!courseData.title || !courseData.description || !courseData.faculty || !courseData.department) {
      showToast("Veuillez remplir tous les champs obligatoires", "error")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData)
      })

      if (!res.ok) throw new Error("Erreur lors de la création")

      showToast("Cours créé avec succès", "success")
      router.push("/instructor/dashboard")
    } catch (error) {
      showToast("Erreur lors de la création du cours", "error")
    } finally {
      setLoading(false)
    }
  }

  const completion = calculateCompletion()
  const currentLevel = levels.find(l => l.value === courseData.level)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (status === "unauthenticated") return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md group-hover:shadow-lg transition-all">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UniLearn
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/instructor/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/instructor/courses">
                <Button variant="ghost" size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Mes cours
                </Button>
              </Link>
              <Link href="/instructor/students">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  Étudiants
                </Button>
              </Link>
              <Link href="/instructor/research">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Microscope className="h-4 w-4" />
                  Recherche
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {session?.user?.name?.slice(0, 2).toUpperCase() || "PR"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">
                      {session?.user?.name}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="cursor-pointer">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Aide
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/api/auth/signout")} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Créer un nouveau cours
              </h1>
              <p className="text-slate-500 mt-1">
                Créez un cours universitaire engageant pour vos étudiants
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-500">Complétion</p>
              <p className="text-2xl font-bold text-blue-600">{completion}%</p>
            </div>
            <Progress value={completion} className="w-32 h-2" />
            <Button
              onClick={handleSubmit}
              disabled={loading || completion < 50}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Publier le cours
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="basics" className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-xl sticky top-20 z-10">
            <TabsTrigger value="basics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg gap-2">
              <BookOpen className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="academic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg gap-2">
              <GraduationCap className="h-4 w-4" />
              Académique
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg gap-2">
              <FileText className="h-4 w-4" />
              Contenu
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg gap-2">
              <CreditCard className="h-4 w-4" />
              Tarification
            </TabsTrigger>
            <TabsTrigger value="publish" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg gap-2">
              <Globe className="h-4 w-4" />
              Publication
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basics" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Informations générales
                </CardTitle>
                <CardDescription>Les informations de base de votre cours universitaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Titre du cours *</Label>
                  <Input
                    value={courseData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ex: Introduction à la Psychologie Cognitive"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sous-titre</Label>
                  <Input
                    value={courseData.subtitle}
                    onChange={(e) => handleChange("subtitle", e.target.value)}
                    placeholder="Un sous-titre accrocheur"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description du cours *</Label>
                  <TipTapEditor
                    value={courseData.description}
                    onChange={(value) => handleChange("description", value)}
                    placeholder="Décrivez votre cours, ses objectifs et son contenu..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Faculté / UFR *</Label>
                    <Select value={courseData.faculty} onValueChange={handleFacultyChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une faculté" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map(fac => (
                          <SelectItem key={fac.value} value={fac.value}>
                            <div className="flex items-center gap-2">
                              {fac.icon}
                              <span>{fac.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Département *</Label>
                    <Select value={courseData.department} onValueChange={(v) => handleChange("department", v)} disabled={!selectedFaculty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un département" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedFaculty && departmentsByFaculty[selectedFaculty]?.map(dept => (
                          <SelectItem key={dept.value} value={dept.value}>
                            <div className="flex items-center gap-2">
                              {dept.icon}
                              <span>{dept.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Mots-clés</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {courseData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                      placeholder="Ajouter un mot-clé"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  Vignette du cours
                </CardTitle>
                <CardDescription>Une image représentative de votre cours</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    courseData.thumbnail ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-blue-500"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {courseData.thumbnail ? (
                    <div className="relative">
                      <img src={courseData.thumbnail} alt="Thumbnail" className="max-h-48 mx-auto rounded-lg" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => { e.stopPropagation(); handleChange("thumbnail", "") }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Cliquez ou glissez-déposez une image</p>
                      <p className="text-sm text-gray-400">PNG, JPG jusqu'à 5MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Objectives, Requirements, Target Audience */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Objectifs pédagogiques
                </CardTitle>
                <CardDescription>Ce que les étudiants apprendront</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {courseData.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="flex-1">{objective}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveObjective(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddObjective()}
                    placeholder="Ajouter un objectif"
                  />
                  <Button type="button" onClick={handleAddObjective}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Informations académiques
                </CardTitle>
                <CardDescription>Niveau, semestre et crédits ECTS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Niveau *</Label>
                    <Select value={courseData.level} onValueChange={(v: any) => handleChange("level", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <span>{level.icon}</span>
                              <span>{level.label}</span>
                              <span className="text-xs text-gray-500">({level.credits} crédits)</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Semestre *</Label>
                    <Select value={courseData.semester} onValueChange={(v) => handleChange("semester", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map(sem => (
                          <SelectItem key={sem.value} value={sem.value}>
                            {sem.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Crédits ECTS</Label>
                    <Input
                      type="number"
                      value={courseData.credits || currentLevel?.credits}
                      onChange={(e) => handleChange("credits", parseInt(e.target.value))}
                      min={0}
                      max={180}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Langue d'enseignement</Label>
                  <Select value={courseData.language} onValueChange={(v) => handleChange("language", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Enseignant responsable</Label>
                  <Input
                    value={courseData.professor}
                    onChange={(e) => handleChange("professor", e.target.value)}
                    placeholder="Professeur responsable du cours"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prérequis</Label>
                  <div className="space-y-2">
                    {courseData.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="flex-1">{req}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveRequirement(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddRequirement()}
                      placeholder="Ajouter un prérequis"
                    />
                    <Button type="button" onClick={handleAddRequirement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Public cible</Label>
                  <div className="space-y-2">
                    {courseData.targetAudience.map((target, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-pink-500" />
                        <span className="flex-1">{target}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTarget(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddTarget()}
                      placeholder="Ex: Étudiants en L3 Psychologie"
                    />
                    <Button type="button" onClick={handleAddTarget}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Plan du cours</h2>
                <p className="text-slate-500">Organisez vos chapitres et leçons</p>
              </div>
              <Button onClick={addSection} className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un chapitre
              </Button>
            </div>

            {courseData.sections.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun chapitre</h3>
                  <p className="text-gray-500 mb-4">Commencez par créer votre premier chapitre</p>
                  <Button onClick={addSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un chapitre
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {courseData.sections.map((section) => (
                  <Card key={section.id} className="border-0 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Input
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="text-lg font-semibold border-0 bg-transparent px-0"
                            placeholder="Titre du chapitre"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => addLesson(section.id)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Leçon
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteSection(section.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={section.description}
                        onChange={(e) => updateSection(section.id, { description: e.target.value })}
                        placeholder="Description du chapitre"
                        className="mt-2 border-0 bg-transparent px-0 resize-none"
                      />
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {section.lessons.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Aucune leçon dans ce chapitre</p>
                          <Button variant="link" onClick={() => addLesson(section.id)} className="mt-2">
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter une leçon
                          </Button>
                        </div>
                      ) : (
                        section.lessons.map((lesson) => (
                          <LessonEditor
                            key={lesson.id}
                            lesson={lesson}
                            sectionId={section.id}
                            onUpdate={updateLesson}
                            onDelete={deleteLesson}
                          />
                        ))
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Tarification
                </CardTitle>
                <CardDescription>Définissez le prix de votre cours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Cours gratuit</p>
                    <p className="text-sm text-gray-500">Les étudiants pourront suivre ce cours gratuitement</p>
                  </div>
                  <Switch checked={courseData.isFree} onCheckedChange={(checked) => handleChange("isFree", checked)} />
                </div>

                {!courseData.isFree && (
                  <div className="space-y-2">
                    <Label>Prix (€)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        value={courseData.price}
                        onChange={(e) => handleChange("price", parseFloat(e.target.value))}
                        className="pl-10"
                        placeholder="99.99"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Prix recommandé pour un cours universitaire: 49€ - 149€
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publish Tab */}
          <TabsContent value="publish" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Publication
                </CardTitle>
                <CardDescription>Paramètres de publication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Cours en vedette</p>
                    <p className="text-sm text-gray-500">Mettre en avant sur la page d'accueil</p>
                  </div>
                  <Switch checked={courseData.featured} onCheckedChange={(checked) => handleChange("featured", checked)} />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Publier le cours</p>
                    <p className="text-sm text-blue-600">
                      {completion >= 80 ? "Votre cours est prêt à être publié !" : `Complétez votre cours (${completion}%) pour le publier`}
                    </p>
                  </div>
                  <Switch checked={courseData.published} onCheckedChange={(checked) => handleChange("published", checked)} disabled={completion < 80} />
                </div>

                {completion < 80 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="font-medium text-yellow-800">Éléments manquants pour la publication</p>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1 ml-6 list-disc">
                      {!courseData.title && <li>Titre du cours requis</li>}
                      {!courseData.description && <li>Description requise</li>}
                      {!courseData.faculty && <li>Faculté requise</li>}
                      {!courseData.department && <li>Département requis</li>}
                      {!courseData.thumbnail && <li>Vignette requise</li>}
                      {courseData.objectives.length === 0 && <li>Ajoutez au moins un objectif pédagogique</li>}
                      {courseData.sections.length === 0 && <li>Ajoutez au moins un chapitre</li>}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}