import mongoose from "mongoose"

const lessonSchema = new mongoose.Schema(
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
    videoUrl: {
      type: String,
      required: true,
    },
    duration: Number,
    order: {
      type: Number,
      required: true,
    },
    resources: [
      {
        name: String,
        url: String,
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema)
