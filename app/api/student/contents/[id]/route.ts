// app/api/student/contents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id: contentId } = await params;
    
    await connectToDatabase();
    const userId = (session.user as any).id;
    
    // Trouver le cours qui contient ce contenu
    const course = await Course.findOne({
      'contents._id': contentId
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Contenu non trouvé' }, { status: 404 });
    }
    
    // Vérifier si l'étudiant est inscrit
    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: course._id,
      status: 'active'
    });
    
    if (!enrollment) {
      return NextResponse.json({ error: 'Non inscrit à ce cours' }, { status: 403 });
    }
    
    const content = course.contents.find(c => c._id.toString() === contentId);
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}