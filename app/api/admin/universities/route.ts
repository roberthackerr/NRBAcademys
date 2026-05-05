// app/api/admin/universities/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import University from "@/models/University"
import User from "@/models/User"
import UniversityAdmin from "@/models/UniversityAdmin"
import mongoose from "mongoose"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

async function isGlobalAdmin(session: any): Promise<boolean> {
  if (!session) return false
  const user = await User.findById((session.user as any).id)
  return user?.role === "global_admin"
}

// Helper pour parser FormData
async function parseFormData(request: NextRequest) {
  const formData = await request.formData()
  const data: any = {}
  
  for (const [key, value] of formData.entries()) {
    // Gérer les checkbox (qui viennent comme "true"/"false" strings)
    if (key === "assignCurrentUserAsAdmin") {
      data[key] = value === "true"
    } else {
      data[key] = value
    }
  }
  
  return { formData, data }
}

// GET - Récupérer toutes les universités
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isGlobal = await isGlobalAdmin(session)
    const userId = (session.user as any).id

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const continent = searchParams.get("continent")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const query: any = {}

    if (status && status !== "all") {
      query.status = status
    }

    if (continent && continent !== "all") {
      query.continent = continent
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { name_en: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }

    if (!isGlobal) {
      const userAdmins = await UniversityAdmin.find({ 
        user: userId, 
        status: "active" 
      }).select("university")
      const universityIds = userAdmins.map(ua => ua.university)
      query._id = { $in: universityIds }
    }

    const skip = (page - 1) * limit

    const [universities, total] = await Promise.all([
      University.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      University.countDocuments(query)
    ])

    const universitiesWithStats = await Promise.all(
      universities.map(async (uni) => {
        const adminCount = await UniversityAdmin.countDocuments({ 
          university: uni._id, 
          status: "active" 
        })
        return {
          ...uni,
          adminCount,
          _id: uni._id.toString(),
        }
      })
    )

    const stats = {
      total: await University.countDocuments(),
      active: await University.countDocuments({ status: "active" }),
      pending: await University.countDocuments({ status: "pending" }),
      suspended: await University.countDocuments({ status: "suspended" }),
      totalStudents: await University.aggregate([
        { $group: { _id: null, total: { $sum: "$studentsCount" } } }
      ]).then(res => res[0]?.total || 0),
      totalPrograms: await University.aggregate([
        { $group: { _id: null, total: { $sum: "$programsCount" } } }
      ]).then(res => res[0]?.total || 0),
    }

    return NextResponse.json({
      universities: universitiesWithStats,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching universities:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Créer une nouvelle université (avec FormData)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(await isGlobalAdmin(session))) {
      return NextResponse.json({ error: "Non autorisé - Admin global requis" }, { status: 401 })
    }

    await connectToDatabase()

    // ✅ Parser le FormData
    const { formData, data } = await parseFormData(request)
    
    console.log("📥 Données reçues:", data)

    // Récupérer le fichier logo
    const logoFile = formData.get("logo") as File
    
    // Validation
    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: "Le nom de l'université est requis" }, { status: 400 })
    }
    if (!data.location || !data.location.trim()) {
      return NextResponse.json({ error: "La localisation est requise" }, { status: 400 })
    }
    if (!data.country || !data.country.trim()) {
      return NextResponse.json({ error: "Le pays est requis" }, { status: 400 })
    }
    if (!data.email || !data.email.trim()) {
      return NextResponse.json({ error: "L'email est requis" }, { status: 400 })
    }

    // Vérifier si l'université existe déjà
    const existing = await University.findOne({ name: data.name })
    if (existing) {
      return NextResponse.json({ error: "Cette université existe déjà" }, { status: 400 })
    }

    // Gérer l'upload du logo
    let logoUrl = null
    if (logoFile && logoFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "universities")
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      const bytes = await logoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(logoFile.name)}`
      const filePath = path.join(uploadDir, uniqueName)
      
      await writeFile(filePath, buffer)
      logoUrl = `/uploads/universities/${uniqueName}`
    }

    const universityData = {
      name: data.name,
      name_en: data.name_en || "",
      location: data.location,
      country: data.country,
      continent: data.continent,
      website: data.website || "",
      email: data.email,
      phone: data.phone || "",
      description: data.description || "",
      address: data.address || "",
      postalCode: data.postalCode || "",
      logo: logoUrl,
      status: "pending",
      studentsCount: 0,
      programsCount: 0,
    }

    const newUniversity = await University.create(universityData)

    // Créer automatiquement un admin pour le créateur
    if (data.assignCurrentUserAsAdmin === true) {
      const userId = (session.user as any).id
      await UniversityAdmin.create({
        user: userId,
        university: newUniversity._id,
        role: "super_admin",
        status: "active",
        invitedBy: userId,
        acceptedAt: new Date(),
      })
    }

    console.log("✅ Université créée:", newUniversity.name)

    return NextResponse.json(
      { 
        success: true,
        message: "Université créée avec succès", 
        university: {
          ...newUniversity.toObject(),
          _id: newUniversity._id.toString()
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("❌ Error creating university:", error)
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "Erreur serveur", 
      details: error.message 
    }, { status: 500 })
  }
}