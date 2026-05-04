"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchBar } from "@/components/search-bar"

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  instructor: { name: string }
  rating: number
}

const categories = [
  "all",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Design",
  "Business",
  "Marketing",
  "Programming",
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query, selectedCategory, selectedLevel, sortBy])

  const performSearch = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append("q", query)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedLevel !== "all") params.append("level", selectedLevel)
      params.append("sortBy", sortBy)

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      setCourses(data.results)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/courses">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">LearnHub</h1>
          </Link>
          <div className="flex gap-4 items-center">
            <SearchBar />
            <Link href="/student/dashboard">
              <Button variant="outline">My Courses</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{query ? `Search Results for "${query}"` : "Search Courses"}</h2>
          <p className="text-gray-600">
            Found {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium block mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setSelectedCategory("all")
                setSelectedLevel("all")
                setSortBy("relevance")
              }}
              variant="outline"
              className="w-full"
            >
              Reset
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Searching...</div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-gray-600 mb-4">No courses found. Try different search terms or filters.</p>
              <Link href="/courses">
                <Button className="bg-blue-600 hover:bg-blue-700">Browse All Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course._id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription>by {course.instructor?.name}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                  <div className="space-y-2 mb-4 mt-auto">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold">{course.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-semibold capitalize">{course.level}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold">${course.price === 0 ? "Free" : course.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <Link href={`/courses/${course._id}`} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">View Course</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
