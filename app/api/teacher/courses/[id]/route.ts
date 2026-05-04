// app/api/teacher/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';
import mongoose from 'mongoose';

export async function PUT(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {


  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
        const { id } = await params
    const courseId = id;

    const body = await req.json();

    const course = await Course.findOneAndUpdate(
      { _id: courseId, teacherId: userId },
      {
        title: body.title,
        description: body.description,
        duration: body.duration,
        price: body.price,
        level: body.level,
        tags: body.tags,
        prerequisites: body.prerequisites,
        objectives: body.objectives
      },
      { new: true }
    );

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

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
    const courseId = params.id;

    const result = await Course.deleteOne({ _id: courseId, teacherId: userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cours supprimé' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}