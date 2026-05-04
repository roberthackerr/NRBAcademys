import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import Course from "@/models/Course"
import Enrollment from "@/models/Enrollment"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  
  try {
    const session = await getServerSession(authOptions)
    
    // Debug - Afficher les infos de session
    console.log("=== API COURSES DEBUG ===")
    console.log("Session exists:", !!session)
    console.log("Session user:", session?.user)
  
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé - Pas de session" }, { status: 401 })
    }


    const sessionUserId = (session.user as any)?.id
    const sessionUserRole = (session.user as any)?.role
    
    console.log("Session userId:", sessionUserId)
    console.log("Target userId:", userId)
    console.log("Session role:", sessionUserRole)
    
    // Vérifier l'autorisation
    if (sessionUserId !== userId){
      console.log("Accès refusé - IDs ne correspondent pas")
      return NextResponse.json(
        { error: "Accès non autorisé - Vous ne pouvez accéder qu'à vos propres données" },
        { status: 403 }
      )
    }

    await connectToDatabase()

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Récupérer les inscriptions actives
    const enrollments = await Enrollment.find({
      user: userId,
      status: "active"
    }).populate("course")

    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course as any
        if (!course) return null
        
        const totalLessons = course.lessons?.length || 0
        const completedLessons = enrollment.completedLessons?.length || 0
        const progressPercentage = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0

        return {
          _id: course._id,
          title: course.title,
          description: course.description || "",
          category: course.category || "General",
          level: course.level || "beginner",
          instructor: course.instructor || { name: "Instructeur" },
          thumbnail: course.thumbnail || null,
          progress: progressPercentage,
          totalLessons: totalLessons,
          completedLessons: completedLessons,
          lastAccessed: enrollment.lastAccessed,
          enrolledAt: enrollment.enrolledAt
        }
      })
    )

    // Filtrer les valeurs null
    const validCourses = coursesWithProgress.filter(c => c !== null)

    return NextResponse.json({
      courses: validCourses,
      total: validCourses.length
    })
  } catch (error) {
    console.error("Error fetching user courses:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des cours" },
      { status: 500 }
    )
  }
}