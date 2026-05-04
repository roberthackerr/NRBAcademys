// app/api/student/courses/[id]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Enrollment from '@/models/Enrollment';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id: courseId } = await params;
    
    await connectToDatabase();
    const userId = (session.user as any).id;
    const { progress, completedLessons, lastLessonId } = await req.json();
    
    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId: userId, courseId: courseId },
      { 
        progress,
        completedLessons: completedLessons || [],
        lastLessonId,
        lastAccessedAt: new Date()
      },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id: courseId } = await params;
    
    await connectToDatabase();
    const userId = (session.user as any).id;
    
    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId
    }).lean();
    
    return NextResponse.json(enrollment || { progress: 0, completedLessons: [] });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}