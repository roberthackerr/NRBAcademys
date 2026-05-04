import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const exclude = searchParams.get("exclude");

    if (!q || q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    await connectToDatabase();

    const users = await User.find({
      _id: { $ne: exclude },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    })
      .select("_id name email role avatar online lastSeen")
      .limit(20)
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}