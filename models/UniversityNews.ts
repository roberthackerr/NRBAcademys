// models/UniversityNews.ts
import mongoose, { Schema, Document } from "mongoose"

export interface IUniversityNews extends Document {
  universityId: mongoose.Types.ObjectId
  title: string
  content: string
  excerpt: string
  image?: string
  category: "announcement" | "event" | "achievement" | "academic" | "research" | "general"
  priority: "high" | "normal" | "low"
  publishedBy: mongoose.Types.ObjectId
  publishedAt: Date
  isPublished: boolean
  views: number
  likes: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const UniversityNewsSchema = new Schema<IUniversityNews>(
  {
    universityId: { type: Schema.Types.ObjectId, ref: "University", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    image: { type: String },
    category: {
      type: String,
      enum: ["announcement", "event", "achievement", "academic", "research", "general"],
      default: "general"
    },
    priority: {
      type: String,
      enum: ["high", "normal", "low"],
      default: "normal"
    },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    tags: [{ type: String }]
  },
  { timestamps: true }
)

UniversityNewsSchema.index({ universityId: 1, createdAt: -1 })

export default mongoose.models.UniversityNews || mongoose.model<IUniversityNews>("UniversityNews", UniversityNewsSchema)