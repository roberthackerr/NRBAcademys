// models/Mention.ts - Modèle Mention
import mongoose, { Schema, Document } from "mongoose"

export interface IMention extends Document {
  name: string
  description: string
  school: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MentionSchema = new Schema<IMention>(
  {
    name: { type: String, required: true },
    description: { type: String },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true }
)

MentionSchema.index({ school: 1, name: 1 }, { unique: true })

export default mongoose.models.Mention || mongoose.model<IMention>("Mention", MentionSchema)