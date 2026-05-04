import { connectToDatabase } from "@/lib/db"
import Course from "@/models/Course"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const level = searchParams.get("level")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = 12
    const skip = (page - 1) * limit

    const query: any = { published: true }
    if (category && category !== "all") query.category = category
    if (level && level !== "all") query.level = level

    const courses = await Course.find(query)
      .populate("instructor", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Course.countDocuments(query)

    return NextResponse.json({
      courses,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching published courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
