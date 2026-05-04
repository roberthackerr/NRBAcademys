import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Enrollment from "@/models/Enrollment"
import Course from "@/models/Course"
import Lesson from "@/models/Lesson"
import QuizResult from "@/models/QuizResult"
import User from "@/models/User" // Import ajouté

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  
  try {
    const session = await getServerSession(authOptions)
    
    console.log("=== API PROGRESS DEBUG ===")
    console.log("Session exists:", !!session)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }


    const sessionUserId = (session.user as any)?.id
    const sessionUserRole = (session.user as any)?.role
    
    if (sessionUserId !== userId && sessionUserRole !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    await connectToDatabase()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const enrollments = await Enrollment.find({
      user: userId,
      status: "active"
    }).populate("course")

    const progressData = []
    let totalProgress = 0
    let totalTimeSpent = 0
    let completedCourses = 0
    let totalLessonsCompleted = 0

    for (const enrollment of enrollments) {
      const course = enrollment.course as any
      if (!course) continue

      const lessons = await Lesson.find({ course: course._id, isPublished: true })
      const totalLessons = lessons.length
      const completedLessons = enrollment.completedLessons?.length || 0
      
      let progressPercentage = 0
      if (totalLessons > 0) {
        progressPercentage = Math.round((completedLessons / totalLessons) * 100)
        if (progressPercentage === 100) completedCourses++
      }

      const timeSpent = enrollment.timeSpent || 0
      totalTimeSpent += timeSpent
      totalProgress += progressPercentage
      totalLessonsCompleted += completedLessons

      progressData.push({
        _id: enrollment._id,
        course: {
          _id: course._id,
          title: course.title,
          level: course.level
        },
        progressPercentage,
        completedLessons: enrollment.completedLessons || [],
        totalLessons,
        lastAccessed: enrollment.lastAccessed,
        timeSpent: { minutes: timeSpent, hours: Math.round(timeSpent / 60) },
        averageQuizScore: 0,
        status: enrollment.status
      })
    }

    const averageProgress = enrollments.length > 0 
      ? Math.round(totalProgress / enrollments.length)
      : 0

    const userStats = user.statistics || {}

    return NextResponse.json({
      progress: progressData,
      summary: {
        totalEnrolledCourses: enrollments.length,
        completedCourses,
        inProgressCourses: enrollments.length - completedCourses,
        averageProgress,
        totalTimeSpent: {
          minutes: totalTimeSpent,
          hours: Math.round(totalTimeSpent / 60),
          formatted: `${Math.floor(totalTimeSpent / 60)}h ${totalTimeSpent % 60}min`
        },
        totalLessonsCompleted,
        averageQuizScore: 0,
        currentStreak: userStats.currentStreak || 0,
        longestStreak: userStats.longestStreak || 0,
        certificatesEarned: completedCourses
      }
    })
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la progression" },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour la progression d'une leçon
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { userId } = params
    const sessionUserId = (session.user as any)?.id
    
    if (sessionUserId !== userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { courseId, lessonId, timeSpent } = body

    if (!courseId || !lessonId) {
      return NextResponse.json(
        { error: "Course ID et Lesson ID requis" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Vérifier si l'inscription existe
    let enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    })

    if (!enrollment) {
      // Créer une inscription si elle n'existe pas
      enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
        status: "active",
        enrolledAt: new Date()
      })
    }

    // Ajouter la leçon aux leçons complétées si pas déjà présente
    const updateData: any = {
      $addToSet: { completedLessons: lessonId },
      $set: { lastAccessed: new Date() }
    }

    if (timeSpent) {
      updateData.$inc = { timeSpent }
    }

    const updatedEnrollment = await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      updateData,
      { new: true }
    )

    // Recalculer la progression
    const lessons = await Lesson.find({ course: courseId, isPublished: true })
    const totalLessons = lessons.length
    const completedLessons = updatedEnrollment.completedLessons?.length || 0
    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    // Mettre à jour le pourcentage de progression
    await Enrollment.findByIdAndUpdate(updatedEnrollment._id, {
      progressPercentage
    })

    // Si le cours est complété, mettre à jour les statistiques
    if (progressPercentage === 100 && updatedEnrollment.status !== "completed") {
      await Enrollment.findByIdAndUpdate(updatedEnrollment._id, {
        status: "completed",
        completedAt: new Date()
      })

      // Mettre à jour les statistiques de l'utilisateur
      await User.findByIdAndUpdate(userId, {
        $inc: { 
          "statistics.totalCoursesCompleted": 1,
          "statistics.totalLessonsCompleted": completedLessons
        }
      })
    } else {
      await User.findByIdAndUpdate(userId, {
        $inc: { "statistics.totalLessonsCompleted": 1 }
      })
    }

    return NextResponse.json({
      success: true,
      progress: {
        percentage: progressPercentage,
        completedLessons,
        totalLessons,
        isCompleted: progressPercentage === 100
      }
    })
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la progression" },
      { status: 500 }
    )
  }
}