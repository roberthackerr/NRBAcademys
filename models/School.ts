// models/School.ts - Modèle École
import mongoose, { Schema, Document } from "mongoose"

export interface ISchool extends Document {
  name: string
  description: string
  university: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true },
    description: { type: String },
    university: { type: Schema.Types.ObjectId, ref: "University", required: true },
  },
  { timestamps: true }
)

SchoolSchema.index({ university: 1, name: 1 }, { unique: true })

export default mongoose.models.School || mongoose.model<ISchool>("School", SchoolSchema)