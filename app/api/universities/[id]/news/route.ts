// app/api/universities/[id]/news/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import UniversityNews from "@/models/UniversityNews"
import UniversityAdmin from "@/models/UniversityAdmin"

// Vérifier si l'utilisateur est admin de l'université
async function isUniversityAdmin(userId: string, universityId: string): Promise<boolean> {
  const admin = await UniversityAdmin.findOne({
    user: userId,
    university: universityId,
    status: "active",
    role: { $in: ["super_admin", "program_admin", "content_admin"] }
  })
  return !!admin
}

// GET - Récupérer les actualités d'une université
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: universityId } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    
    await connectToDatabase()
    
    const filter: any = { universityId, isPublished: true }
    if (category && category !== "all") filter.category = category
    
    const skip = (page - 1) * limit
    
    const [news, total] = await Promise.all([
      UniversityNews.find(filter)
        .sort({ priority: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("publishedBy", "name avatar")
        .lean(),
      UniversityNews.countDocuments(filter)
    ])
    
    return NextResponse.json({
      success: true,
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching university news:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Créer une actualité (admin seulement)
// app/api/universities/[id]/news/route.ts (modification POST)
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    const { id: universityId } = await params
    const userId = (session.user as any).id
    
    const isAdmin = await isUniversityAdmin(userId, universityId)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès non autorisé - Admin requis" }, { status: 403 })
    }
    
    await connectToDatabase()
    
    // Récupérer le FormData (pour l'image)
    const formData = await req.formData()
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const category = formData.get("category") as string
    const priority = formData.get("priority") as string
    const tagsString = formData.get("tags") as string
    const imageFile = formData.get("image") as File
    
    let imageUrl = null
    
    // Gérer l'upload de l'image
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "universities", universityId, "news")
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(imageFile.name)}`
      const filePath = path.join(uploadDir, uniqueName)
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      
      await writeFile(filePath, buffer)
      imageUrl = `/uploads/universities/${universityId}/news/${uniqueName}`
    }
    
    const tags = tagsString ? tagsString.split(",").map(t => t.trim()).filter(t => t) : []
    
    const news = await UniversityNews.create({
      universityId,
      title,
      content,
      excerpt,
      category: category || "general",
      priority: priority || "normal",
      tags,
      image: imageUrl,
      publishedBy: userId,
      publishedAt: new Date(),
      isPublished: true
    })
    
    return NextResponse.json({ success: true, news }, { status: 201 })
  } catch (error) {
    console.error("Error creating news:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}