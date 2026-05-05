// models/Partnership.ts
import mongoose, { Schema, Document } from "mongoose"

export interface IPartnership extends Document {
  universityId: mongoose.Types.ObjectId
  partnerId: mongoose.Types.ObjectId
  status: "pending" | "active" | "declined" | "cancelled"
  type: "academic" | "research" | "student_exchange" | "dual_degree"
  agreementSignedAt?: Date
  startDate?: Date
  endDate?: Date
  documents?: string[]
  notes?: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PartnershipSchema = new Schema<IPartnership>(
  {
    universityId: { type: Schema.Types.ObjectId, ref: "University", required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: "University", required: true },
    status: {
      type: String,
      enum: ["pending", "active", "declined", "cancelled"],
      default: "pending"
    },
    type: {
      type: String,
      enum: ["academic", "research", "student_exchange", "dual_degree"],
      required: true
    },
    agreementSignedAt: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    documents: [{ type: String }],
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
)

// Éviter les doublons
PartnershipSchema.index({ universityId: 1, partnerId: 1 }, { unique: true })

export default mongoose.models.Partnership || mongoose.model<IPartnership>("Partnership", PartnershipSchema)