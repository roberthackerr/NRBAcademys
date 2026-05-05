// app/api/admin/universities/route.ts - GET (liste) & POST (création)
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import University from "@/models/University"
import User from "@/models/User"
import UniversityAdmin from "@/models/UniversityAdmin"
import mongoose from "mongoose"

// Vérifier si l'utilisateur est admin global
async function isGlobalAdmin(session: any): Promise<boolean> {
  if (!session) return false
  const user = await User.findById((session.user as any).id)
  return user?.role === "global_admin"
}

// GET - Récupérer toutes les universités (avec filtres)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les droits (admin global ou admin université)
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

    // Filtrage par statut
    if (status && status !== "all") {
      query.status = status
    }

    // Filtrage par continent
    if (continent && continent !== "all") {
      query.continent = continent
    }

    // Recherche textuelle
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { name_en: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }

    // Si c'est un admin université (pas global), filtrer par ses universités
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

    // Compter les stats supplémentaires
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

    // Statistiques globales
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

// POST - Créer une nouvelle université
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(await isGlobalAdmin(session))) {
      return NextResponse.json({ error: "Non autorisé - Admin global requis" }, { status: 401 })
    }

    await connectToDatabase()

    const formData = await request.formData()
    
    const universityData = {
      name: formData.get("name") as string,
      name_en: formData.get("name_en") as string,
      location: formData.get("location") as string,
      country: formData.get("country") as string,
      continent: formData.get("continent") as string,
      website: formData.get("website") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      postalCode: formData.get("postalCode") as string,
      status: "pending",
    }

    // Validation
    if (!universityData.name || !universityData.location || !universityData.country || !universityData.email) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
    }

    // Vérifier si l'université existe déjà
    const existing = await University.findOne({ name: universityData.name })
    if (existing) {
      return NextResponse.json({ error: "Cette université existe déjà" }, { status: 400 })
    }

    // Gérer l'upload du logo
    let logoUrl = null
    const logoFile = formData.get("logo") as File
    if (logoFile && logoFile.size > 0) {
      // Ici, vous pouvez uploader vers un service comme Cloudinary, AWS S3, etc.
      // Pour l'exemple, on simule
      logoUrl = `/uploads/${Date.now()}_${logoFile.name}`
      // TODO: Implémenter l'upload réel
    }

    const newUniversity = await University.create({
      ...universityData,
      logo: logoUrl,
    })

    // Créer automatiquement un admin super_admin pour le créateur?
    if (formData.get("assignCurrentUserAsAdmin") === "true") {
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

    return NextResponse.json(
      { message: "Université créée avec succès", university: newUniversity },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating university:", error)
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erreur serveur" ,m:error}, { status: 500 })
  }
}