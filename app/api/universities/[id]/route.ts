// app/api/universities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import University from "@/models/University"
import mongoose from "mongoose"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectToDatabase()
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }
    
    const university = await University.findById(id).lean()
    
    if (!university) {
      return NextResponse.json({ error: "Université non trouvée" }, { status: 404 })
    }
    
    return NextResponse.json(university)
  } catch (error) {
    console.error("Error fetching university:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}