// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let filter: any = { isPublished: true };
    
    if (level && level !== 'all') {
      filter.level = level;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const courses = await Course.find(filter)
      .populate('teacherId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}