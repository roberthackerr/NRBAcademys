// app/api/auth/register/route.ts
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name, 
      email, 
      password, 
      role,
      birthDate,
      address,
      city,
      country,
      phone,
      // ✅ Données académiques (de l'étape 2)
      university,
      school,
      level,
      mention,
      filiere
    } = body

    // Validation des champs requis
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    await connectToDatabase()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // ✅ Créer l'utilisateur avec TOUTES les données
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      lastActivity: new Date(),
      statistics: {
        totalCoursesStarted: 0,
        totalCoursesCompleted: 0,
        totalLessonsCompleted: 0,
        totalTimeSpent: 0,
        averageQuizScore: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    }

    // Ajouter les champs optionnels s'ils existent
    if (birthDate) userData.birthDate = new Date(birthDate)
    if (address) userData.address = address
    if (city) userData.city = city
    if (country) userData.country = country
    if (phone) userData.phone = phone
    
    // ✅ Ajouter les données académiques (IDs MongoDB)
    if (university) userData.university = university
    if (school) userData.school = school
    if (level) userData.level = level
    if (mention) userData.mention = mention
    if (filiere) userData.filiere = filiere

    console.log("📝 Création utilisateur avec:", { 
      email, 
      name, 
      university, 
      school, 
      level, 
      mention, 
      filiere 
    })

    const newUser = await User.create(userData)

    console.log("✅ Utilisateur créé:", newUser._id)

    return NextResponse.json(
      { 
        success: true,
        message: "Inscription réussie", 
        user: { 
          id: newUser._id, 
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        } 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("❌ Erreur inscription:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'inscription" }, 
      { status: 500 }
    )
  }
}