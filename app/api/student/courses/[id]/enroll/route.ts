// app/api/student/courses/[id]/enroll/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export async function POST(
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
    
    // Vérifier si le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }
    
    // Vérifier si déjà inscrit
    const existingEnrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId,
      status: 'active'
    });
    
    if (existingEnrollment) {
      return NextResponse.json({ error: 'Déjà inscrit à ce cours' }, { status: 400 });
    }
    
    // Créer l'inscription
    const enrollment = await Enrollment.create({
      studentId: userId,
      courseId: courseId,
      status: 'active',
      enrolledAt: new Date(),
      progress: 0
    });
    
    // Incrémenter le compteur d'étudiants
    await Course.findByIdAndUpdate(courseId, {
      $inc: { studentsCount: 1 }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Inscription réussie',
      enrollment 
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}