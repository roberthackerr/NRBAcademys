// app/api/admin/universities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import University from "@/models/University"
import School from "@/models/School"
import Mention from "@/models/Mention"
import Filiere from "@/models/Filiere"
import UniversityAdmin from "@/models/UniversityAdmin"
import User from "@/models/User"
import mongoose from "mongoose"

// Vérifier les droits d'accès à une université
async function canAccessUniversity(userId: string, universityId: string, requireSuperAdmin: boolean = false): Promise<boolean> {
  const user = await User.findById(userId)
  
  // Admin global a tous les droits
  if (user?.role === "global_admin") return true
  
  // Vérifier si l'utilisateur est admin de cette université
  const admin = await UniversityAdmin.findOne({
    user: userId,
    university: universityId,
    status: "active",
  })
  
  if (!admin) return false
  
  if (requireSuperAdmin && admin.role !== "super_admin") return false
  
  return true
}

// GET - Récupérer une université spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const canAccess = await canAccessUniversity(userId, id)
    
    if (!canAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    await connectToDatabase()

    const university = await University.findById(id).lean()
    
    if (!university) {
      return NextResponse.json({ error: "Université non trouvée" }, { status: 404 })
    }

    // Compter les écoles, mentions, filières
    const schools = await School.find({ university: id }).lean()
    const schoolIds = schools.map(s => s._id)
    
    const mentions = await Mention.find({ school: { $in: schoolIds } }).lean()
    const mentionIds = mentions.map(m => m._id)
    
    const filieres = await Filiere.find({ mention: { $in: mentionIds } }).lean()
    
    // Compter les admins actifs
    const adminsCount = await UniversityAdmin.countDocuments({ university: id, status: "active" })

    const stats = {
      schoolsCount: schools.length,
      mentionsCount: mentions.length,
      filieresCount: filieres.length,
      adminsCount: adminsCount,
    }

    return NextResponse.json({
      ...university,
      _id: university._id.toString(),
      stats,
    })
  } catch (error) {
    console.error("Error fetching university:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH - Mettre à jour une université
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const canAccess = await canAccessUniversity(userId, id, true) // Nécessite super_admin
    
    if (!canAccess) {
      return NextResponse.json({ error: "Non autorisé - Super admin requis" }, { status: 403 })
    }

    await connectToDatabase()

    const body = await request.json()
    const allowedUpdates = [
      "name", "name_en", "location", "country", "continent",
      "website", "email", "phone", "description", "address",
      "postalCode", "status", "logo"
    ]
    
    const updates: Record<string, any> = {}
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    const updatedUniversity = await University.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).lean()

    if (!updatedUniversity) {
      return NextResponse.json({ error: "Université non trouvée" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Université mise à jour",
      university: { ...updatedUniversity, _id: updatedUniversity._id.toString() }
    })
  } catch (error) {
    console.error("Error updating university:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Supprimer une université
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const user = await User.findById(userId)
    
    // Seul un admin global peut supprimer une université
    if (user?.role !== "global_admin") {
      return NextResponse.json({ error: "Non autorisé - Admin global requis" }, { status: 403 })
    }

    await connectToDatabase()

    // Vérifier si l'université existe
    const university = await University.findById(id)
    if (!university) {
      return NextResponse.json({ error: "Université non trouvée" }, { status: 404 })
    }

    // Supprimer toutes les données associées (cascade)
    const schools = await School.find({ university: id })
    const schoolIds = schools.map(s => s._id)
    
    // Supprimer les filières associées aux mentions
    const mentions = await Mention.find({ school: { $in: schoolIds } })
    const mentionIds = mentions.map(m => m._id)
    
    await Filiere.deleteMany({ mention: { $in: mentionIds } })
    await Mention.deleteMany({ school: { $in: schoolIds } })
    await School.deleteMany({ university: id })
    await UniversityAdmin.deleteMany({ university: id })
    await University.findByIdAndDelete(id)

    return NextResponse.json({ message: "Université supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting university:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}