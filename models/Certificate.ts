// models/Certificate.ts
import mongoose, { Schema } from 'mongoose';

const CertificateSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String, required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  grade: { type: String },
  score: { type: Number, min: 0, max: 100 },
  credits: { type: Number, default: 0 },
  duration: { type: String },
  skills: [{ type: String }],
  certificateUrl: { type: String },
  verificationCode: { type: String, unique: true },
  isVerified: { type: Boolean, default: true },
  issuer: {
    name: { type: String, default: 'NRBAcademy' },
    logo: { type: String }
  },
  metadata: {
    hoursCompleted: { type: Number, default: 0 },
    assignmentsCompleted: { type: Number, default: 0 },
    quizzesPassed: { type: Number, default: 0 },
    finalExamScore: { type: Number, default: 0 }
  }
}, { timestamps: true });

CertificateSchema.index({ verificationCode: 1 });
CertificateSchema.index({ studentId: 1, issueDate: -1 });

export default mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);