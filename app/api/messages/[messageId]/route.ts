import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Message from "@/models/Message";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    await connectToDatabase();

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return NextResponse.json({ error: "Message non trouvé" }, { status: 404 });
    }

    // Soft delete - ajouter l'ID à la liste deletedBy
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedBy: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}