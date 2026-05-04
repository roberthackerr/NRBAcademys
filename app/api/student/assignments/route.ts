// app/api/student/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const assignments = await Assignment.find()
      .populate('courseId', 'title')
      .lean();

    // Récupérer les soumissions de l'étudiant
    const submissions = await Submission.find({ studentId: userId }).lean();

    // Enrichir les assignments avec les soumissions
    const assignmentsWithSubmissions = assignments.map(assignment => {
      const submission = submissions.find(s => s.assignmentId === assignment._id.toString());
      return {
        ...assignment,
        submitted: !!submission,
        submission: submission || null
      };
    });

    return NextResponse.json(assignmentsWithSubmissions);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}