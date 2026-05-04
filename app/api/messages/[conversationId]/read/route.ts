import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Message from "@/models/Message";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }"àmpàé"

    const body = await request.json();
    const { userId } = body;

    await connectToDatabase();

    await Message.updateMany(
      {
        sender: conversationId,
        receiver: userId,
        read: false
      },
      { read: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}