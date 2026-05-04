// models/User.ts - VERSION CORRIGÉE
import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      required: true,
      unique: true,  // ✅ Garder UNIQUEMENT ici
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin", "global_admin"], // ✅ Ajout global_admin
      default: "student",
    },
    bio: {
      type: String,
      default: ""
    },
    avatar: {
      type: String,
      default: ""
    },
    
    birthDate: {
      type: Date,
    },
    address: {
      type: String,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },
    level: {
      type: String,
      enum: ["L1", "L2", "L3", "M1", "M2", "Doctorat"],
    },
    mention: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mention",
    },
    filiere: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Filiere",
    },
    
    enrolledCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }],
    createdCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
    
    lastActivity: {
      type: Date,
      default: Date.now
    },
    
    learningPreferences: {
      style: {
        type: String,
        enum: ["visual", "auditory", "reading", "kinesthetic"],
        default: "visual"
      },
      pace: {
        type: String,
        enum: ["slow", "medium", "fast"],
        default: "medium"
      }
    },
    
    statistics: {
      totalCoursesStarted: { type: Number, default: 0 },
      totalCoursesCompleted: { type: Number, default: 0 },
      totalLessonsCompleted: { type: Number, default: 0 },
      totalTimeSpent: { type: Number, default: 0 },
      averageQuizScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastStudyDate: Date
    }
  },
  { timestamps: true }
)

// ✅ SUPPRIMEZ CETTE LIGNE SI ELLE EXISTE (index dupliqué)
userSchema.index({ email: 1 })

// Garder seulement ces indexes
userSchema.index({ role: 1 })
userSchema.index({ "statistics.currentStreak": -1 })

export default mongoose.models.User || mongoose.model("User", userSchema)