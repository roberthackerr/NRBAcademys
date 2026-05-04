import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const sessionUserId = (session.user as any)?.id
    if (sessionUserId !== userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Convertir le fichier en base64 (solution simple, pour la production utilisez un service comme Cloudinary)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    await connectToDatabase()

    await User.findByIdAndUpdate(userId, { avatar: base64 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }
}