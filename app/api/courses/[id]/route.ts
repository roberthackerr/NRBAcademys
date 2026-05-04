// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectToDatabase();
    
    const course = await Course.findById(id)
      .populate('teacherId', 'firstName lastName email avatar')
      .lean();
    
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}