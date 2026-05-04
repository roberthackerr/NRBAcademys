// types/course.ts
export enum ContentType {
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  TEXT = 'text',
  PDF = 'pdf'
}

export enum SubmissionStatus {
  PENDING = 'pending',
  GRADED = 'graded'
}

export interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  prerequisites: string[];
  objectives: string[];
  isPublished: boolean;
  studentsCount: number;
  teacherId: number;
  contents?: CourseContent[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseContent {
  id: number;
  title: string;
  description: string;
  type: ContentType;
  duration: number;
  content?: string;
  fileUrl?: string;
  fileSize?: number;
  order: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions: string;
  deadline: string;
  maxPoints: number;
  courseId: number;
  teacherId: number;
  course?: Course;
  submissions?: Submission[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: number;
  content: string;
  fileUrl: string;
  grade: number;
  feedback: string;
  status: SubmissionStatus;
  assignmentId: number;
  studentId: number;
  teacherId: number;
  assignment?: Assignment;
  student?: User;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  firstName?: string;
  lastName?: string;
  avatar?: string;
}