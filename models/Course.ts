// models/Course.ts
import mongoose, { Schema } from 'mongoose';

const CourseContentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['video', 'audio', 'image', 'text', 'pdf'], default: 'video' },
  duration: { type: Number },
  content: { type: String },
  fileUrl: { type: String },
  fileSize: { type: Number },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const CourseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number },
  price: { type: Number, default: 0 },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  tags: [{ type: String }],
  prerequisites: [{ type: String }],
  objectives: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  studentsCount: { type: Number, default: 0 },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contents: [CourseContentSchema]
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);