// models/University.ts - Modèle Université
import mongoose, { Schema, Document } from "mongoose"

export interface IUniversity extends Document {
  name: string
  name_en: string
  location: string
  country: string
  continent: string
  website: string
  email: string
  phone: string
  description: string
  address: string
  postalCode: string
  logo: string
  status: "active" | "pending" | "suspended"
  studentsCount: number
  programsCount: number
  adminCount: number
  createdAt: Date
  updatedAt: Date
}

const UniversitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true, unique: true },
    name_en: { type: String },
    location: { type: String, required: true },
    country: { type: String, required: true },
    continent: { type: String, required: true },
    website: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    description: { type: String },
    address: { type: String },
    postalCode: { type: String },
    logo: { type: String },
    status: { type: String, enum: ["active", "pending", "suspended"], default: "pending" },
    studentsCount: { type: Number, default: 0 },
    programsCount: { type: Number, default: 0 },
    adminCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.University || mongoose.model<IUniversity>("University", UniversitySchema)