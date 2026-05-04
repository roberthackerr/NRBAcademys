import mongoose from "mongoose"

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      "course_started",
      "lesson_viewed",
      "lesson_completed",
      "quiz_started",
      "quiz_passed",
      "quiz_failed",
      "assignment_submitted",
      "course_completed",
      "certificate_earned",
      "forum_post",
      "comment_posted",
      "resource_downloaded"
    ],
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    index: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson"
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz"
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  details: {
    type: String,
    default: ""
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
})

// Index composé pour les requêtes fréquentes
ActivityLogSchema.index({ user: 1, createdAt: -1 })
ActivityLogSchema.index({ user: 1, type: 1, createdAt: -1 })
ActivityLogSchema.index({ course: 1, createdAt: -1 })

export default mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema)