import mongoose from "mongoose"

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    quizScores: [
      {
        quiz: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz",
        },
        score: Number,
        completed: Boolean,
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Progress || mongoose.model("Progress", progressSchema)
