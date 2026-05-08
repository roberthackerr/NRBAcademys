// app/api/users/[id]/academic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { userId } = await params;
    const id=userId;
    const body = await req.json();
    
    await connectToDatabase();
    
    // Validation des IDs
    if (body.university && !mongoose.Types.ObjectId.isValid(body.university)) {
      return NextResponse.json({ error: "ID université invalide" }, { status: 400 });
    }
    if (body.school && !mongoose.Types.ObjectId.isValid(body.school)) {
      return NextResponse.json({ error: "ID école invalide" }, { status: 400 });
    }
    if (body.mention && !mongoose.Types.ObjectId.isValid(body.mention)) {
      return NextResponse.json({ error: "ID mention invalide" }, { status: 400 });
    }
    if (body.filiere && !mongoose.Types.ObjectId.isValid(body.filiere)) {
      return NextResponse.json({ error: "ID filière invalide" }, { status: 400 });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        university: body.university || null,
        school: body.school || null,
        mention: body.mention || null,
        filiere: body.filiere || null,
        level: body.level || null
      },
      { new: true, runValidators: true }
    )
    .populate("university", "name name_en location country continent logo email phone website")
    .populate("school", "name")
    .populate("mention", "name")
    .populate("filiere", "name duration credits");
    
    if (!updatedUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Profil académique mis à jour",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating academic profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}