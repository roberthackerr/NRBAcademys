// app/api/teacher/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Submission from '@/models/Submission';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const submissions = await Submission.find({ teacherId: userId })
      .populate('assignmentId', 'title')
      .populate('studentId', 'name email firstName lastName')
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}