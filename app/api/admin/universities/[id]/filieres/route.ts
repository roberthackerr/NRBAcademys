// app/api/admin/universities/[id]/filieres/route.ts - Gestion des filières
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Filiere from "@/models/Filiere"
import Mention from "@/models/Mention"
import School from "@/models/School"
import UniversityAdmin from "@/models/UniversityAdmin"
import User from "@/models/User"

const validLevels = ["Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2", "Doctorat", "Bachelor 1", "Bachelor 2", "Bachelor 3"]

async function canManageUniversity(userId: string, universityId: string): Promise<boolean> {
  const user = await User.findById(userId)
  if (user?.role === "global_admin") return true
  
  const admin = await UniversityAdmin.findOne({
    user: userId,
    university: universityId,
    status: "active",
    role: { $in: ["super_admin", "program_admin"] }
  })
  return !!admin
}

// GET - Récupérer toutes les filières d'une université
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: universityId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const canAccess = await canManageUniversity(userId, universityId)
    
    if (!canAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    await connectToDatabase()

    // Trouver toutes les écoles et mentions de l'université
    const schools = await School.find({ university: universityId }).select("_id")
    const schoolIds = schools.map(s => s._id)
    
    const mentions = await Mention.find({ school: { $in: schoolIds } }).select("_id")
    const mentionIds = mentions.map(m => m._id)
    
    const filieres = await Filiere.find({ mention: { $in: mentionIds } })
      .populate("mention", "name")
      .lean()
    
    return NextResponse.json(filieres.map(f => ({ ...f, _id: f._id.toString() })))
  } catch (error) {
    console.error("Error fetching filieres:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Créer une nouvelle filière
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: universityId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const canManage = await canManageUniversity(userId, universityId)
    
    if (!canManage) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    await connectToDatabase()

    const { name, description, duration, credits, level, mentionId } = await request.json()

    if (!name || !mentionId || !level) {
      return NextResponse.json({ error: "Nom, mention et niveau sont requis" }, { status: 400 })
    }

    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: `Niveau invalide. Valeurs acceptées: ${validLevels.join(", ")}` }, { status: 400 })
    }

    // Vérifier que la mention appartient bien à l'université via les écoles
    const mention = await Mention.findById(mentionId)
    if (!mention) {
      return NextResponse.json({ error: "Mention non trouvée" }, { status: 404 })
    }
    
    const school = await School.findOne({ _id: mention.school, university: universityId })
    if (!school) {
      return NextResponse.json({ error: "Mention n'appartient pas à cette université" }, { status: 403 })
    }

    // Vérifier si la filière existe déjà
    const existing = await Filiere.findOne({ mention: mentionId, name })
    if (existing) {
      return NextResponse.json({ error: "Cette filière existe déjà" }, { status: 400 })
    }

    const newFiliere = await Filiere.create({
      name,
      description,
      duration: duration || "Non spécifié",
      credits: credits || 0,
      level,
      mention: mentionId,
    })

    return NextResponse.json(
      { message: "Filière créée avec succès", filiere: { ...newFiliere.toObject(), _id: newFiliere._id.toString() } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating filiere:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}