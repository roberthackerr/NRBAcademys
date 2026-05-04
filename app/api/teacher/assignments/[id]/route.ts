// app/api/teacher/assignments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Assignment from '@/models/Assignment';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const assignmentId = params.id;

    const result = await Assignment.deleteOne({ _id: assignmentId, teacherId: userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Devoir non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Devoir supprimé' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}