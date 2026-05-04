import { connectToDatabase } from "@/lib/db"
import Course from "@/models/Course"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const level = searchParams.get("level")
    const sortBy = searchParams.get("sortBy") || "relevance"

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const mongoQuery: any = {
      published: true,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }

    if (category && category !== "all") {
      mongoQuery.category = category
    }
    if (level && level !== "all") {
      mongoQuery.level = level
    }

    let sortOptions: any = {}
    switch (sortBy) {
      case "newest":
        sortOptions = { createdAt: -1 }
        break
      case "popular":
        sortOptions = { enrolledStudents: -1 }
        break
      case "rating":
        sortOptions = { rating: -1 }
        break
      default:
        sortOptions = { createdAt: -1 }
    }

    const courses = await Course.find(mongoQuery).populate("instructor", "name").sort(sortOptions).limit(50)

    return NextResponse.json({
      results: courses,
      count: courses.length,
    })
  } catch (error) {
    console.error("Error searching courses:", error)
    return NextResponse.json({ error: "Failed to search courses" }, { status: 500 })
  }
}
