import mongoose from "mongoose"

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
      },
    ],
    passingScore: {
      type: Number,
      default: 70,
    },
    order: Number,
  },
  { timestamps: true },
)

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema)
