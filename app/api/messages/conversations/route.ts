import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    await connectToDatabase();

    // Récupérer les conversations uniques
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$content" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$read", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "participant"
        }
      },
      {
        $unwind: "$participant"
      },
      {
        $project: {
          id: "$_id",
          name: "$participant.name",
          role: "$participant.role",
          avatar: "$participant.avatar",
          lastMessage: 1,
          timestamp: "$lastMessageTime",
          unread: "$unreadCount",
          online: { $literal: false } // À implémenter avec WebSocket
        }
      },
      {
        $sort: { timestamp: -1 }
      }
    ]);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, otherUserId } = body;

    if (!userId || !otherUserId) {
      return NextResponse.json({ error: "Utilisateurs requis" }, { status: 400 });
    }

    if (userId === otherUserId) {
      return NextResponse.json({ error: "Vous ne pouvez pas créer une conversation avec vous-même" }, { status: 400 });
    }

    await connectToDatabase();

    // Vérifier si l'autre utilisateur existe
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Vérifier si une conversation existe déjà (via un message existant)
    const existingMessage = await Message.findOne({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).limit(1);

    // Si un message existe, retourner l'ID de l'autre utilisateur comme identifiant de conversation
    if (existingMessage) {
      return NextResponse.json({ 
        conversationId: otherUserId,
        exists: true 
      });
    }

    // Pas besoin de créer un document de conversation séparé
    // Les messages créeront automatiquement la conversation
    return NextResponse.json({ 
      conversationId: otherUserId,
      exists: false 
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}