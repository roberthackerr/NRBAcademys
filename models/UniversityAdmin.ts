// models/UniversityAdmin.ts - Modèle Admin d'université
import mongoose, { Schema, Document } from "mongoose"

export interface IUniversityAdmin extends Document {
  user: mongoose.Types.ObjectId
  university: mongoose.Types.ObjectId
  role: "super_admin" | "program_admin" | "content_admin" | "viewer"
  status: "active" | "invited" | "suspended"
  invitedBy: mongoose.Types.ObjectId
  invitedAt: Date
  acceptedAt: Date
  lastActive: Date
}

const UniversityAdminSchema = new Schema<IUniversityAdmin>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    university: { type: Schema.Types.ObjectId, ref: "University", required: true },
    role: { 
      type: String, 
      enum: ["super_admin", "program_admin", "content_admin", "viewer"], 
      default: "viewer" 
    },
    status: { type: String, enum: ["active", "invited", "suspended"], default: "invited" },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invitedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    lastActive: { type: Date },
  },
  { timestamps: true }
)

UniversityAdminSchema.index({ user: 1, university: 1 }, { unique: true })

export default mongoose.models.UniversityAdmin || mongoose.model<IUniversityAdmin>("UniversityAdmin", UniversityAdminSchema)