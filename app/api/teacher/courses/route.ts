// app/api/teacher/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const courses = await Course.find({ teacherId: userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
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

    const course = await Course.create({
      title: body.title,
      description: body.description,
      duration: body.duration,
      price: body.price,
      level: body.level,
      tags: body.tags,
      prerequisites: body.prerequisites,
      objectives: body.objectives,
      teacherId: userId
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}