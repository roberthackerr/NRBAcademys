// app/api/teacher/courses/contents/[contentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';
import { unlink } from 'fs/promises';
import path from 'path';

export async function PUT(
  req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const duration = parseInt(formData.get('duration') as string) || 0;
    const contentText = formData.get('content') as string;
    const file = formData.get('file') as File;

    // Trouver le cours qui contient ce contenu
    const course = await Course.findOne({ 
      'contents._id': params.contentId,
      teacherId: userId 
    });

    if (!course) {
      return NextResponse.json({ error: 'Contenu non trouvé' }, { status: 404 });
    }

    const contentIndex = course.contents.findIndex(
      (c: any) => c._id.toString() === params.contentId
    );

    if (contentIndex === -1) {
      return NextResponse.json({ error: 'Contenu non trouvé' }, { status: 404 });
    }

    const oldContent = course.contents[contentIndex];

    // Gestion du nouveau fichier
    let fileUrl = oldContent.fileUrl;
    let fileSize = oldContent.fileSize;

    if (file && file.size > 0) {
      // Supprimer l'ancien fichier si existant
      if (oldContent.fileUrl) {
        const oldFilePath = path.join(process.cwd(), 'public', oldContent.fileUrl);
        try {
          await unlink(oldFilePath);
        } catch (e) {}
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'course-contents');
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
      const filePath = path.join(uploadDir, uniqueName);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      await writeFile(filePath, buffer);
      
      fileUrl = `/uploads/course-contents/${uniqueName}`;
      fileSize = file.size;
    }

    // Mettre à jour le contenu
    course.contents[contentIndex] = {
      ...oldContent,
      title,
      description: description || '',
      type,
      duration,
      content: type === 'text' ? contentText : null,
      fileUrl,
      fileSize
    };

    await course.save();

    return NextResponse.json(course.contents[contentIndex]);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const course = await Course.findOne({ 
      'contents._id': contentId,
      teacherId: userId 
    });

    if (!course) {
      return NextResponse.json({ error: 'Contenu non trouvé' }, { status: 404 });
    }

    const contentToDelete = course.contents.find(
      (c: any) => c._id.toString() === contentId
    );

    // Supprimer le fichier associé
    if (contentToDelete?.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', contentToDelete.fileUrl);
      try {
        await unlink(filePath);
      } catch (e) {}
    }

    course.contents = course.contents.filter(
      (c: any) => c._id.toString() !== contentId
    );

    await course.save();

    return NextResponse.json({ message: 'Contenu supprimé' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Helper pour écrire un fichier
async function writeFile(path: string, buffer: Buffer) {
  const { writeFile } = await import('fs/promises');
  await writeFile(path, buffer);
}