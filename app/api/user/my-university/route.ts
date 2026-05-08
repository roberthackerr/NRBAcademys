// app/api/user/my-university/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import University from "@/models/University"
import UniversityAdmin from "@/models/UniversityAdmin"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    await connectToDatabase()
    const userId = (session.user as any).id

    // Vérifier si l'utilisateur est admin d'une université
    const adminRoles = await UniversityAdmin.find({ 
      user: userId, 
      status: "active" 
    }).populate("university").lean()

    // Vérifier si l'utilisateur a une université via son profil étudiant
    const user = await User.findById(userId).populate("university").lean()

    const universities = []

    // Ajouter les universités où l'utilisateur est admin
    for (const admin of adminRoles) {
      if (admin.university) {
        universities.push({
          universityId: admin.university._id,
          university: admin.university,
          role: admin.role,
          status: admin.status,
          joinedAt: admin.createdAt
        })
      }
    }

    // Ajouter l'université de l'utilisateur (si étudiant)
    if (user?.university && !universities.find(u => u.universityId === user.university._id)) {
      universities.push({
        universityId: user.university._id,
        university: user.university,
        role: user.role === "instructor" ? "instructor" : "student",
        status: "active",
        joinedAt: user.createdAt
      })
    }

    return NextResponse.json({
      success: true,
      universities
    })
  } catch (error) {
    console.error("Error fetching my universities:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}