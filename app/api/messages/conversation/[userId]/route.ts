import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("userId");

    if (!currentUserId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    await connectToDatabase();

    const otherUser = await User.findById(userId)
      .select("_id name email role avatar online lastSeen")
      .lean();

    if (!otherUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ user: otherUser });
  } catch (error) {
    console.error("Error fetching conversation user:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}