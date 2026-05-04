// app/api/admin/universities/[id]/admins/route.ts - Gestion des administrateurs
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import UniversityAdmin from "@/models/UniversityAdmin"
import University from "@/models/University"
import User from "@/models/User"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

async function canManageAdmins(userId: string, universityId: string): Promise<boolean> {
  const user = await User.findById(userId)
  if (user?.role === "global_admin") return true
  
  const admin = await UniversityAdmin.findOne({
    user: userId,
    university: universityId,
    status: "active",
    role: "super_admin"
  })
  return !!admin
}

// GET - Récupérer tous les administrateurs d'une université
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
    const canAccess = await canManageAdmins(userId, universityId)
    
    if (!canAccess) {
      return NextResponse.json({ error: "Accès non autorisé - Super admin requis" }, { status: 403 })
    }

    await connectToDatabase()

    const universityAdmins = await UniversityAdmin.find({ university: universityId })
      .populate("user", "name email phone avatar")
      .populate("invitedBy", "name email")
      .lean()

    const admins = universityAdmins.map(ua => ({
      id: (ua.user as any)._id.toString(),
      name: (ua.user as any).name,
      email: (ua.user as any).email,
      phone: (ua.user as any).phone || "",
      avatar: (ua.user as any).avatar,
      role: ua.role,
      status: ua.status,
      invitedBy: (ua.invitedBy as any)?.name,
      invitedAt: ua.invitedAt,
      acceptedAt: ua.acceptedAt,
      lastActive: ua.lastActive,
    }))

    // Statistiques
    const stats = {
      total: admins.length,
      superAdmin: admins.filter(a => a.role === "super_admin").length,
      programAdmin: admins.filter(a => a.role === "program_admin").length,
      contentAdmin: admins.filter(a => a.role === "content_admin").length,
      viewer: admins.filter(a => a.role === "viewer").length,
      active: admins.filter(a => a.status === "active").length,
      invited: admins.filter(a => a.status === "invited").length,
    }

    return NextResponse.json({ admins, stats })
  } catch (error) {
    console.error("Error fetching admins:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Inviter un administrateur
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
    const canManage = await canManageAdmins(userId, universityId)
    
    if (!canManage) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    await connectToDatabase()

    const { name, email, phone, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: "Email et rôle sont requis" }, { status: 400 })
    }

    // Trouver ou créer l'utilisateur
    let user = await User.findOne({ email })

    if (!user) {
      // Créer un compte temporaire
      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(tempPassword, 10)
      
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        phone,
        password: hashedPassword,
        role: "university_admin",
        emailVerified: false,
      })
      
      // TODO: Envoyer un email d'invitation avec le mot de passe temporaire
    }

    // Vérifier si l'utilisateur est déjà admin de cette université
    const existing = await UniversityAdmin.findOne({
      user: user._id,
      university: universityId,
    })

    if (existing) {
      return NextResponse.json({ error: "Cet utilisateur est déjà administrateur de cette université" }, { status: 400 })
    }

    // Créer la relation admin-université
    const newAdmin = await UniversityAdmin.create({
      user: user._id,
      university: universityId,
      role,
      status: "invited",
      invitedBy: userId,
    })

    // Mettre à jour le compteur d'admins de l'université
    await University.findByIdAndUpdate(universityId, { $inc: { adminCount: 1 } })

    return NextResponse.json(
      { 
        message: "Invitation envoyée avec succès",
        admin: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: newAdmin.role,
          status: newAdmin.status,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error inviting admin:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}