// app/api/student/assignments/[id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    await connectToDatabase();
    const userId = (session.user as any).id;

    // Vérifier que le devoir existe
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Devoir non trouvé' }, { status: 404 });
    }

    // Vérifier si l'étudiant a déjà soumis
    const existingSubmission = await Submission.findOne({ assignmentId, studentId: userId });
    if (existingSubmission) {
      return NextResponse.json({ error: 'Vous avez déjà soumis ce devoir' }, { status: 400 });
    }

    const formData = await req.formData();
    const content = formData.get('content') as string;
    const file = formData.get('file') as File;

    let fileUrl: string | null = null;
    let fileSize: number | null = null;

    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'submissions');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
      const filePath = path.join(uploadDir, uniqueName);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      await writeFile(filePath, buffer);
      
      fileUrl = `/uploads/submissions/${uniqueName}`;
      fileSize = file.size;
    }

    const submission = await Submission.create({
      assignmentId,
      studentId: userId,
      teacherId: assignment.teacherId,
      content: content || '',
      fileUrl,
      fileSize,
      status: 'pending',
      submittedAt: new Date()
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}