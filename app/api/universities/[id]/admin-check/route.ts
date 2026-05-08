// app/api/universities/[id]/admin-check/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import UniversityAdmin from "@/models/UniversityAdmin"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ isAdmin: false })
    }
    
    const { id: universityId } = await params
    const userId = (session.user as any).id
    
    await connectToDatabase()
    
    const admin = await UniversityAdmin.findOne({
      user: userId,
      university: universityId,
      status: "active",
      role: { $in: ["super_admin", "program_admin", "content_admin"] }
    })
    
    return NextResponse.json({ isAdmin: !!admin })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false })
  }
}