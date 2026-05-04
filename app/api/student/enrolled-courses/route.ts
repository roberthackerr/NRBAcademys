// app/api/student/enrolled-courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    await connectToDatabase();
    const userId = (session.user as any).id;
    
    const enrollments = await Enrollment.find({ 
      studentId: userId, 
      status: 'active' 
    }).populate('courseId').lean();
    
    const enrolledCourses = enrollments.map(e => e.courseId);
    
    return NextResponse.json(enrolledCourses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}