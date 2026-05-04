// app/api/academic-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import University from "@/models/University";
import School from "@/models/School";
import Mention from "@/models/Mention";
import Filiere from "@/models/Filiere";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get("type");
    const universityId = searchParams.get("universityId");
    const schoolId = searchParams.get("schoolId");
    const mentionId = searchParams.get("mentionId");

    await connectToDatabase();

    // Récupérer toutes les universités
    if (type === "universities") {
      const universities = await University.find({ status: "active" })
        .select("_id name name_en location country continent website logo stats")
        .lean();
      
      return NextResponse.json({
        success: true,
        data: universities.map(u => ({
          ...u,
          id: u._id.toString(),
          _id: u._id.toString()
        }))
      });
    }

    // Récupérer les écoles d'une université
    if (type === "schools" && universityId) {
      const schools = await School.find({ university: universityId })
        .select("_id name description")
        .lean();
      
      return NextResponse.json({
        success: true,
        data: schools.map(s => ({
          ...s,
          id: s._id.toString(),
          _id: s._id.toString()
        }))
      });
    }

    // Récupérer les mentions d'une école
    if (type === "mentions" && schoolId) {
      const mentions = await Mention.find({ school: schoolId })
        .select("_id name description")
        .lean();
      
      return NextResponse.json({
        success: true,
        data: mentions.map(m => ({
          ...m,
          id: m._id.toString(),
          _id: m._id.toString()
        }))
      });
    }

    // Récupérer les filières d'une mention
    if (type === "filieres" && mentionId) {
      const filieres = await Filiere.find({ mention: mentionId })
        .select("_id name description duration credits level")
        .lean();
      
      return NextResponse.json({
        success: true,
        data: filieres.map(f => ({
          ...f,
          id: f._id.toString(),
          _id: f._id.toString()
        }))
      });
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    
  } catch (error) {
    console.error("Error fetching academic data:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}