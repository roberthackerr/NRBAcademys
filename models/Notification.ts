import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    type: {
      type: String,
      enum: ["new_lesson", "quiz_available", "course_published", "course_update"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: String,
  },
  { timestamps: true },
)

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema)
