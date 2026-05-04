// models/Filiere.ts - Modèle Filière
import mongoose, { Schema, Document } from "mongoose"

export interface IFiliere extends Document {
  name: string
  description: string
  duration: string
  credits: number
  level: string
  mention: mongoose.Types.ObjectId 
  createdAt: Date
  updatedAt: Date
}

const FiliereSchema = new Schema<IFiliere>(
  {
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: String, required: true },
    credits: { type: Number, required: true, min: 0 },
    level: { type: String, required: true },
    mention: { type: Schema.Types.ObjectId, ref: "Mention", required: true },
  },
  { timestamps: true }
)

FiliereSchema.index({ mention: 1, name: 1 }, { unique: true })

export default mongoose.models.Filiere || mongoose.model<IFiliere>("Filiere", FiliereSchema)