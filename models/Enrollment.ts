// models/Enrollment.ts
import mongoose, { Schema } from 'mongoose';

const EnrollmentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  progress: { type: Number, default: 0 },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Empêcher les doublons
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);