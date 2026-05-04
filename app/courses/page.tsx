"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  ArrowRight,
  GraduationCap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  instructor: { name: string; avatar?: string }
  rating: number
  reviews: number
  duration: number
  students: number
  thumbnail?: string
}

const categories = [
  { value: "all", label: "All Categories", icon: "📚" },
  { value: "Web Development", label: "Web Development", icon: "🌐", color: "bg-blue-100 text-blue-700" },
  { value: "Mobile Development", label: "Mobile Development", icon: "📱", color: "bg-purple-100 text-purple-700" },
  { value: "Data Science", label: "Data Science", icon: "📊", color: "bg-green-100 text-green-700" },
  { value: "Design", label: "Design", icon: "🎨", color: "bg-pink-100 text-pink-700" },
  { value: "Business", label: "Business", icon: "💼", color: "bg-yellow-100 text-yellow-700" },
  { value: "Marketing", label: "Marketing", icon: "📈", color: "bg-red-100 text-red-700" },
  { value: "Programming", label: "Programming", icon: "💻", color: "bg-indigo-100 text-indigo-700" },
]

const levels = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-700" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-700" },
  { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-700" },
]

export default function CourseBrowsePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [page, selectedCategory, selectedLevel, sortBy])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams()
      query.append("page", page.toString())
      if (selectedCategory !== "all") query.append("category", selectedCategory)
      if (selectedLevel !== "all") query.append("level", selectedLevel)
      query.append("sort", sortBy)

      const response = await fetch(`/api/courses/published?${query}`)
      const data = await response.json()
      setCourses(data.courses)
      setFilteredCourses(data.courses)
      setTotalPages(data.pages)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCourses(filtered)
  }, [searchTerm, courses])

  const sortedCourses = useMemo(() => {
    const coursesToSort = [...filteredCourses]
    switch (sortBy) {
      case "price-low":
        return coursesToSort.sort((a, b) => a.price - b.price)
      case "price-high":
        return coursesToSort.sort((a, b) => b.price - a.price)
      case "rating":
        return coursesToSort.sort((a, b) => b.rating - a.rating)
      case "newest":
        return coursesToSort.reverse()
      default:
        return coursesToSort.sort((a, b) => b.students - a.students)
    }
  }, [filteredCourses, sortBy])

  const CourseSkeleton = () => (
    <Card className="overflow-hidden border-0 shadow-lg">
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-blue-50/50">
      {/* Navigation améliorée */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  LearnHub
                </h1>
                <p className="text-xs text-gray-500">Discover. Learn. Grow.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="hidden sm:flex text-gray-600 hover:text-blue-600">
                  Home
                </Button>
              </Link>
              <Link href="/student/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30">
              <Sparkles className="mr-2 h-4 w-4" />
              10,000+ Courses Available
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Discover Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Next Skill
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
              Explore expert-led courses with hands-on projects and industry-recognized certifications
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search courses, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-12 py-6 text-lg border-2 focus:border-blue-500 rounded-xl shadow-sm"
              />
            </div>

            <Button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              variant="outline"
              className="md:hidden py-6 rounded-xl"
            >
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-64 py-6 rounded-xl border-2">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Most Popular
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Highest Rated
                  </div>
                </SelectItem>
                <SelectItem value="price-low">
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    Price: Low to High
                  </div>
                </SelectItem>
                <SelectItem value="price-high">
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    Price: High to Low
                  </div>
                </SelectItem>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <span>🆕</span>
                    Newest First
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white rounded-xl shadow-lg p-4 mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <Button
                    onClick={() => setShowMobileFilters(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat.value}
                          onClick={() => {
                            setSelectedCategory(cat.value)
                            setPage(1)
                          }}
                          variant={selectedCategory === cat.value ? "default" : "outline"}
                          size="sm"
                          className={selectedCategory === cat.value ? "bg-blue-600" : ""}
                        >
                          {cat.icon} {cat.label === "All Categories" ? "All" : cat.label.split(" ")[0]}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Level</label>
                    <div className="flex flex-wrap gap-2">
                      {levels.map((level) => (
                        <Button
                          key={level.value}
                          onClick={() => {
                            setSelectedLevel(level.value)
                            setPage(1)
                          }}
                          variant={selectedLevel === level.value ? "default" : "outline"}
                          size="sm"
                          className={`${selectedLevel === level.value ? level.color : ""}`}
                        >
                          {level.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Filters */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filter by:</h3>
              <Button
                onClick={() => {
                  setSelectedCategory("all")
                  setSelectedLevel("all")
                  setSearchTerm("")
                }}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                <X className="mr-2 h-4 w-4" />
                Clear all filters
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value)
                    setPage(1)
                  }}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  className={`px-4 py-2 rounded-full ${selectedCategory === cat.value ? cat.color : ""}`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <Button
                  key={level.value}
                  onClick={() => {
                    setSelectedLevel(level.value)
                    setPage(1)
                  }}
                  variant={selectedLevel === level.value ? "default" : "outline"}
                  className={`px-4 py-2 rounded-full ${selectedLevel === level.value ? level.color : ""}`}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? "Loading..." : `${sortedCourses.length} Courses Found`}
            </h2>
            <p className="text-gray-600">
              {selectedCategory !== "all" && `Category: ${selectedCategory} • `}
              {selectedLevel !== "all" && `Level: ${selectedLevel}`}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4" />
            <span>Recommended based on your interests</span>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : sortedCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <Button
              onClick={() => {
                setSelectedCategory("all")
                setSelectedLevel("all")
                setSearchTerm("")
                setPage(1)
              }}
              variant="outline"
              className="rounded-full"
            >
              Reset all filters
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence>
                {sortedCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full group">
                      <div className="relative overflow-hidden">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-white opacity-80" />
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 border-0">
                          {course.category}
                        </Badge>
                        {course.price === 0 && (
                          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
                            FREE
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge
                            variant="outline"
                            className={`${
                              course.level === "beginner"
                                ? "bg-green-50 text-green-700"
                                : course.level === "intermediate"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {course.level}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{course.rating.toFixed(1)}</span>
                            <span className="text-gray-500 text-sm">({course.reviews})</span>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs">
                            {course.instructor.name.charAt(0)}
                          </div>
                          {course.instructor.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration}h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.students.toLocaleString()}+</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            <span>Certificate</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <Link href={`/courses/${course._id}`} className="w-full">
                          <Button className="w-full group/btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
                            <span>View Course</span>
                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t"
              >
                <div className="text-sm text-gray-600">
                  Showing page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          className={`w-10 h-10 rounded-full ${
                            page === pageNum ? "bg-gradient-to-r from-blue-600 to-indigo-600" : ""
                          }`}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* CTA Section */}
        {!loading && sortedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 text-center border-2 border-blue-100"
          >
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex p-3 bg-blue-100 rounded-full mb-6">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Can't find what you're looking for?
              </h3>
              <p className="text-gray-600 mb-8">
                Suggest a course topic or explore our personalized course recommendations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/courses/recommendations">
                  <Button variant="outline" className="rounded-full px-8 py-6">
                    Get Personalized Recommendations
                  </Button>
                </Link>
                <Link href="/instructor/become">
                  <Button className="rounded-full px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                    Become an Instructor
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} LearnHub. Empowering learners worldwide.</p>
          <p className="mt-2">10,000+ courses • 500+ expert instructors • 2M+ learners</p>
        </div>
      </footer>
    </div>
  )
}