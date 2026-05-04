// app/api/admin/universities/[id]/mentions/route.ts - Gestion des mentions
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Mention from "@/models/Mention"
import School from "@/models/School"
import UniversityAdmin from "@/models/UniversityAdmin"
import User from "@/models/User"

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

// GET - Récupérer toutes les mentions d'une université
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

    // Trouver toutes les écoles de l'université
    const schools = await School.find({ university: universityId }).select("_id")
    const schoolIds = schools.map(s => s._id)
    
    const mentions = await Mention.find({ school: { $in: schoolIds } })
      .populate("school", "name")
      .lean()
    
    return NextResponse.json(mentions.map(m => ({ ...m, _id: m._id.toString() })))
  } catch (error) {
    console.error("Error fetching mentions:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Créer une nouvelle mention
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

    const { name, description, schoolId } = await request.json()

    if (!name || !schoolId) {
      return NextResponse.json({ error: "Nom et école sont requis" }, { status: 400 })
    }

    // Vérifier que l'école appartient bien à l'université
    const school = await School.findOne({ _id: schoolId, university: universityId })
    if (!school) {
      return NextResponse.json({ error: "École non trouvée" }, { status: 404 })
    }

    // Vérifier si la mention existe déjà
    const existing = await Mention.findOne({ school: schoolId, name })
    if (existing) {
      return NextResponse.json({ error: "Cette mention existe déjà" }, { status: 400 })
    }

    const newMention = await Mention.create({
      name,
      description,
      school: schoolId,
    })

    return NextResponse.json(
      { message: "Mention créée avec succès", mention: { ...newMention.toObject(), _id: newMention._id.toString() } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating mention:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}