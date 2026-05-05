// app/api/universities/partnerships/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Partnership from "@/models/Partnership"
import mongoose from "mongoose"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    const { id } = await params
    await connectToDatabase()
    const body = await req.json()
    const { status } = body
    
    if (!status || !["active", "declined", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }
    
    const partnership = await Partnership.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    
    if (!partnership) {
      return NextResponse.json({ error: "Partenariat non trouvé" }, { status: 404 })
    }
    
    return NextResponse.json(partnership)
  } catch (error) {
    console.error("Error updating partnership status:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}