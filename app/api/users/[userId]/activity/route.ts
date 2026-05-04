import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import ActivityLog from "@/models/ActivityLog"
import Enrollment from "@/models/Enrollment"
import User from "@/models/User" // Import manquant ajouté

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type") // Filtrer par type d'activité
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit
    
    // Vérifier l'autorisation
    const sessionUserId = (session.user as any)?.id
    const sessionUserRole = (session.user as any)?.role
    
    if (sessionUserId !== userId && sessionUserRole !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    await connectToDatabase()

    // Construire la requête
    const query: any = { user: userId }
    if (type) query.type = type

    // Compter le total des activités
    const total = await ActivityLog.countDocuments(query)

    // Récupérer les activités récentes
    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("course", "title thumbnail slug")
      .populate("lesson", "title")
      .populate("quiz", "title")
      .populate("relatedUser", "name avatar")

    // Formater les activités
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      type: activity.type,
      courseId: activity.course?._id,
      courseTitle: activity.course?.title,
      courseSlug: activity.course?.slug,
      lessonId: activity.lesson?._id,
      lessonTitle: activity.lesson?.title,
      quizId: activity.quiz?._id,
      quizTitle: activity.quiz?.title,
      details: activity.details,
      timestamp: activity.createdAt,
      metadata: activity.metadata
    }))

    // Calculer les statistiques sur toutes les activités (pas juste la page)
    const allActivities = await ActivityLog.find({ user: userId })
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const stats = {
      total: total,
      byType: {
        course_started: allActivities.filter(a => a.type === "course_started").length,
        lesson_viewed: allActivities.filter(a => a.type === "lesson_viewed").length,
        lesson_completed: allActivities.filter(a => a.type === "lesson_completed").length,
        quiz_started: allActivities.filter(a => a.type === "quiz_started").length,
        quiz_passed: allActivities.filter(a => a.type === "quiz_passed").length,
        quiz_failed: allActivities.filter(a => a.type === "quiz_failed").length,
        assignment_submitted: allActivities.filter(a => a.type === "assignment_submitted").length,
        course_completed: allActivities.filter(a => a.type === "course_completed").length,
        certificate_earned: allActivities.filter(a => a.type === "certificate_earned").length,
        forum_post: allActivities.filter(a => a.type === "forum_post").length,
        comment_posted: allActivities.filter(a => a.type === "comment_posted").length,
        resource_downloaded: allActivities.filter(a => a.type === "resource_downloaded").length
      },
      thisWeek: allActivities.filter(a => new Date(a.createdAt) > weekAgo).length,
      thisMonth: allActivities.filter(a => {
        const monthAgo = new Date()
        monthAgo.setDate(monthAgo.getDate() - 30)
        return new Date(a.createdAt) > monthAgo
      }).length
    }

    return NextResponse.json({
      activities: formattedActivities,
      stats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasMore: skip + limit < total
      }
    })
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des activités" },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle activité
export async function POST(
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
    const { type, courseId, lessonId, quizId, details, metadata, score } = body

    // Validation du type d'activité
    const validTypes = [
      "course_started", "lesson_viewed", "lesson_completed",
      "quiz_started", "quiz_passed", "quiz_failed",
      "assignment_submitted", "course_completed", "certificate_earned",
      "forum_post", "comment_posted", "resource_downloaded"
    ]
    
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type d'activité invalide" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Créer l'activité
    const activity = await ActivityLog.create({
      user: userId,
      type,
      course: courseId,
      lesson: lessonId,
      quiz: quizId,
      details,
      metadata: {
        ...metadata,
        score,
        userAgent: request.headers.get("user-agent"),
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
      },
      createdAt: new Date()
    })

    // Mettre à jour la dernière activité de l'utilisateur
    await User.findByIdAndUpdate(userId, {
      lastActivity: new Date(),
      $inc: { "statistics.totalTimeSpent": metadata?.timeSpent || 0 }
    })

    // Si c'est une leçon complétée, mettre à jour la progression
    if (type === "lesson_completed" && courseId && lessonId) {
      const enrollment = await Enrollment.findOneAndUpdate(
        { user: userId, course: courseId },
        {
          $addToSet: { completedLessons: lessonId },
          $set: { lastAccessed: new Date() },
          $inc: { timeSpent: metadata?.timeSpent || 0 }
        },
        { new: true }
      )

      // Vérifier si le cours est complété
      if (enrollment) {
        // Ici vous pouvez ajouter la logique pour vérifier si toutes les leçons sont complétées
        // et marquer le cours comme complété si nécessaire
      }
    }

    // Si c'est un quiz réussi, mettre à jour les statistiques
    if (type === "quiz_passed" && score) {
      await User.findByIdAndUpdate(userId, {
        $inc: { "statistics.totalQuizzesPassed": 1 }
      })
    }

    // Si c'est un cours complété
    if (type === "course_completed") {
      await User.findByIdAndUpdate(userId, {
        $inc: { "statistics.totalCoursesCompleted": 1 }
      })
      
      // Mettre à jour le streak
      const user = await User.findById(userId)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const lastStudyDate = user.statistics?.lastStudyDate
      if (lastStudyDate) {
        const lastDate = new Date(lastStudyDate)
        lastDate.setHours(0, 0, 0, 0)
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          // Jour consécutif
          const newStreak = (user.statistics?.currentStreak || 0) + 1
          await User.findByIdAndUpdate(userId, {
            $set: {
              "statistics.currentStreak": newStreak,
              "statistics.lastStudyDate": today
            },
            $max: { "statistics.longestStreak": newStreak }
          })
        } else if (diffDays > 1) {
          // Streak perdu
          await User.findByIdAndUpdate(userId, {
            $set: {
              "statistics.currentStreak": 1,
              "statistics.lastStudyDate": today
            }
          })
        }
      } else {
        // Premier jour d'étude
        await User.findByIdAndUpdate(userId, {
          $set: {
            "statistics.currentStreak": 1,
            "statistics.lastStudyDate": today,
            "statistics.longestStreak": 1
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      activity: {
        id: activity._id,
        type: activity.type,
        timestamp: activity.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de l'activité" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une activité (admin seulement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const sessionUserRole = (session.user as any)?.role
    
    // Seul l'admin peut supprimer des activités
    if (sessionUserRole !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get("activityId")
    
    if (!activityId) {
      return NextResponse.json(
        { error: "ID d'activité requis" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const activity = await ActivityLog.findByIdAndDelete(activityId)
    
    if (!activity) {
      return NextResponse.json(
        { error: "Activité non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Activité supprimée avec succès"
    })
  } catch (error) {
    console.error("Error deleting activity:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'activité" },
      { status: 500 }
    )
  }
}