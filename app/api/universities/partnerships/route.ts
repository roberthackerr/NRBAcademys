// app/api/universities/partnerships/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Partnership from "@/models/Partnership"
import University from "@/models/University"
import mongoose from "mongoose"

// GET - Récupérer les partenariats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    await connectToDatabase()
    
    // Récupérer l'université de l'utilisateur (via son rôle admin)
    const userId = new mongoose.Types.ObjectId((session.user as any).id)
    const userUniversity = await University.findOne({ adminId: userId })
    
    if (!userUniversity) {
      return NextResponse.json({ partnerships: [] })
    }
    
    const partnerships = await Partnership.find({
      $or: [
        { universityId: userUniversity._id },
        { partnerId: userUniversity._id }
      ]
    })
      .populate("universityId", "name name_en location country continent logo")
      .populate("partnerId", "name name_en location country continent logo")
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json({ partnerships })
  } catch (error) {
    console.error("Error fetching partnerships:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Créer une demande de partenariat
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    await connectToDatabase()
    const userId = new mongoose.Types.ObjectId((session.user as any).id)
    const body = await req.json()
    const { partnerId, type } = body
    
    if (!partnerId || !type) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }
    
    // Récupérer l'université de l'utilisateur
    const userUniversity = await University.findOne({ adminId: userId })
    if (!userUniversity) {
      return NextResponse.json({ error: "Aucune université associée" }, { status: 404 })
    }
    
    // Vérifier si le partenariat existe déjà
    const existing = await Partnership.findOne({
      $or: [
        { universityId: userUniversity._id, partnerId },
        { universityId: partnerId, partnerId: userUniversity._id }
      ]
    })
    
    if (existing) {
      return NextResponse.json({ error: "Demande déjà existante" }, { status: 400 })
    }
    
    const partnership = await Partnership.create({
      universityId: userUniversity._id,
      partnerId,
      type,
      status: "pending",
      createdBy: userId
    })
    
    // Incrémenter le compteur de partenariats
    await University.findByIdAndUpdate(userUniversity._id, {
      $inc: { partnerships: 1 }
    })
    await University.findByIdAndUpdate(partnerId, {
      $inc: { partnerships: 1 }
    })
    
    return NextResponse.json(partnership, { status: 201 })
  } catch (error) {
    console.error("Error creating partnership:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}