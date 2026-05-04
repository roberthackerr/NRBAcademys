// models/Assignment.ts
import mongoose, { Schema } from 'mongoose';

const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructions: { type: String },
  deadline: { type: Date, required: true },
  maxPoints: { type: Number, default: 100 },
  fileUrl: { type: String },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submissionsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);