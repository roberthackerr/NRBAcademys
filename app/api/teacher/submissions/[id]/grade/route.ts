// app/api/teacher/submissions/[id]/grade/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Submission from '@/models/Submission';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    await connectToDatabase();
    const userId = (session.user as any).id;
    const body = await req.json();

    // Validation de la note
    if (body.grade !== undefined && (body.grade < 0 || body.grade > 20)) {
      return NextResponse.json({ error: 'La note doit être comprise entre 0 et 20' }, { status: 400 });
    }

    const submission = await Submission.findOneAndUpdate(
      { _id: id, teacherId: userId },
      { 
        grade: body.grade, 
        feedback: body.feedback || '', 
        status: body.grade !== undefined && body.grade !== null ? 'graded' : 'pending'
      },
      { new: true, runValidators: true }
    ).populate('assignmentId', 'title maxPoints')
     .populate('studentId', 'firstName lastName email');

    if (!submission) {
      return NextResponse.json({ error: 'Soumission non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Soumission notée avec succès',
      submission
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}