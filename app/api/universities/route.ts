// app/api/universities/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import University from "@/models/University"

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const continent = searchParams.get("continent")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    
    const skip = (page - 1) * limit
    
    const filter: any = { status: "active" }
    
    if (continent && continent !== "all") {
      filter.continent = continent
    }
    
    if (type && type !== "all") {
      filter.type = type
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { name_en: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } }
      ]
    }
    
    const [universities, total] = await Promise.all([
      University.find(filter)
        .sort({ studentsCount: -1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      University.countDocuments(filter)
    ])
    
    return NextResponse.json({
      universities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching universities:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}