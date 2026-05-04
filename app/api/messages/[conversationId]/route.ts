import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    await connectToDatabase();

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: conversationId },
        { sender: conversationId, receiver: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      content: msg.content,
      sender: msg.sender === userId ? "me" : "other",
      timestamp: new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      read: msg.read
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, content, receiverId } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    await connectToDatabase();

    const message = await Message.create({
      sender: userId,
      receiver: receiverId || conversationId,
      content: content.trim(),
      read: false,
      createdAt: new Date()
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}