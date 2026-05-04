import mongoose from "mongoose"

const QuizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    points: Number
  }],
  timeSpent: {
    type: Number, // en secondes
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  }
})

QuizResultSchema.index({ user: 1, course: 1, quiz: 1 })
QuizResultSchema.index({ user: 1, attemptedAt: -1 })

export default mongoose.models.QuizResult || mongoose.model("QuizResult", QuizResultSchema)