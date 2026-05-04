import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import Enrollment from "@/models/Enrollment"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const sessionUserId = (session.user as any)?.id
    if (sessionUserId !== userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    await connectToDatabase()

    // Récupérer l'utilisateur sans populate
    const user = await User.findById(userId).lean()

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Compter les inscriptions
    const enrollments = await Enrollment.find({ user: userId })
    const completedCourses = enrollments.filter(e => e.status === "completed").length
    const totalHoursSpent = enrollments.reduce((acc, e) => acc + (e.timeSpent || 0), 0) / 60

    // Récupérer les noms des références si besoin
    let universityName = null
    let schoolName = null
    let mentionName = null
    let filiereName = null

    // Si vous avez les modèles, décommentez ces lignes
    /*
    if (user.university) {
      const University = await import("@/models/University").then(m => m.default)
      const uni = await University.findById(user.university).lean()
      universityName = uni?.name
    }
    if (user.school) {
      const School = await import("@/models/School").then(m => m.default)
      const sch = await School.findById(user.school).lean()
      schoolName = sch?.name
    }
    if (user.mention) {
      const Mention = await import("@/models/Mention").then(m => m.default)
      const men = await Mention.findById(user.mention).lean()
      mentionName = men?.name
    }
    if (user.filiere) {
      const Filiere = await import("@/models/Filiere").then(m => m.default)
      const fil = await Filiere.findById(user.filiere).lean()
      filiereName = fil?.name
    }
    */

    const profile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio || "",
      phone: (user as any).phone || "",
      birthDate: user.birthDate,
      address: user.address || "",
      university: user.university ? { _id: user.university, name: universityName } : null,
      school: user.school ? { _id: user.school, name: schoolName } : null,
      level: user.level,
      mention: user.mention ? { _id: user.mention, name: mentionName } : null,
      filiere: user.filiere ? { _id: user.filiere, name: filiereName } : null,
      enrolledCoursesCount: enrollments.length,
      completedCoursesCount: completedCourses,
      totalHoursSpent: Math.round(totalHoursSpent),
      certificatesCount: completedCourses,
      currentStreak: user.statistics?.currentStreak || 0,
      longestStreak: user.statistics?.longestStreak || 0,
      averageQuizScore: user.statistics?.averageQuizScore || 0,
      joinedAt: user.createdAt,
      lastActive: user.lastActivity || user.createdAt
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const sessionUserId = (session.user as any)?.id
    if (sessionUserId !== userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { name, bio, phone, address } = body

    await connectToDatabase()

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).lean()

    return NextResponse.json({
      id: updatedUser._id,
      name: updatedUser.name,
      bio: updatedUser.bio,
      phone: (updatedUser as any).phone,
      address: updatedUser.address
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}