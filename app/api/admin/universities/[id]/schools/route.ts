// app/api/admin/universities/[id]/schools/route.ts - Gestion des écoles
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import School from "@/models/School"
import University from "@/models/University"
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

// GET - Récupérer toutes les écoles d'une université
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

    const schools = await School.find({ university: universityId }).lean()
    
    return NextResponse.json(schools.map(s => ({ ...s, _id: s._id.toString() })))
  } catch (error) {
    console.error("Error fetching schools:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Créer une nouvelle école
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

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })
    }

    // Vérifier si l'école existe déjà
    const existing = await School.findOne({ university: universityId, name })
    if (existing) {
      return NextResponse.json({ error: "Cette école existe déjà" }, { status: 400 })
    }

    const newSchool = await School.create({
      name,
      description,
      university: universityId,
    })

    // Mettre à jour le compteur de programmes de l'université
    await University.findByIdAndUpdate(universityId, { $inc: { programsCount: 1 } })

    return NextResponse.json(
      { message: "École créée avec succès", school: { ...newSchool.toObject(), _id: newSchool._id.toString() } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating school:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}