// app/api/student/certificates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Certificate from '@/models/Certificate';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const certificates = await Certificate.find({ studentId: userId })
      .sort({ issueDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}