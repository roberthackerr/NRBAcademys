// app/api/teacher/courses/[id]/unpublish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const courseId = id;

    const course = await Course.findOneAndUpdate(
      { _id: courseId, teacherId: userId },
      { isPublished: false },
      { new: true }
    );

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cours dépublié' });
  } catch (error) {
    console.error('Error unpublishing course:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}