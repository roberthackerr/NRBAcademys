// app/api/teacher/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const assignments = await Assignment.find({ teacherId: userId })
      .populate('courseId', 'title')
      .sort({ deadline: 1 })
      .lean();

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const body = await req.json();

    // Vérifier que le cours appartient bien à l'enseignant
    const course = await Course.findOne({ _id: body.courseId, teacherId: userId });
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    const assignment = await Assignment.create({
      title: body.title,
      description: body.description,
      instructions: body.instructions,
      deadline: new Date(body.deadline),
      maxPoints: body.maxPoints || 100,
      courseId: body.courseId,
      teacherId: userId
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}