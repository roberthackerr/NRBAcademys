// models/Submission.ts
import mongoose, { Schema } from 'mongoose';

export enum SubmissionStatus {
  PENDING = 'pending',
  GRADED = 'graded',
  LATE = 'late'
}

const SubmissionSchema = new Schema({
  content: { type: String },
  fileUrl: { type: String },
  fileSize: { type: Number },
  originalName: { type: String },
  grade: { type: Number },
  feedback: { type: String },
  status: { 
    type: String, 
    enum: Object.values(SubmissionStatus), 
    default: SubmissionStatus.PENDING 
  },
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);