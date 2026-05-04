// app/api/teacher/courses/[id]/contents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

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

    // Vérifier que l'enseignant possède le cours
    const course = await Course.findOne({ _id: courseId, teacherId: userId });
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const duration = parseInt(formData.get('duration') as string) || 0;
    const contentText = formData.get('content') as string;
    const file = formData.get('file') as File;

    let fileUrl: string | null = null;
    let fileSize: number | null = null;

    // Gestion du fichier uploadé
    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'course-contents');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
      const filePath = path.join(uploadDir, uniqueName);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      await writeFile(filePath, buffer);
      
      fileUrl = `/uploads/course-contents/${uniqueName}`;
      fileSize = file.size;
    }

    const newContent = {
      title,
      description: description || '',
      type,
      duration,
      content: type === 'text' ? contentText : null,
      fileUrl,
      fileSize,
      order: course.contents?.length || 0
    };

    course.contents.push(newContent);
    await course.save();

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Error adding content:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}