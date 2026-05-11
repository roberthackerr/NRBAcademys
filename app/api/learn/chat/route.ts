// app/api/learn/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { OpenAI } from 'openai';
import mongoose from 'mongoose';

// Configuration OpenRouter / OpenAI
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Nexus - Assistant Pédagogique"
  }
});

// System prompts
const SYSTEM_PROMPTS: Record<string, string> = {
  general: `Tu es NEXUS AI developpé par Roberto ,Ricah et Narovana  , un assistant pédagogique intelligent et bienveillant pour NRBAcademy.
  
RÈGLES IMPORTANTES :
- Tu aides les étudiants à comprendre leurs cours
- Tu ne donnes jamais les réponses directement, tu guides vers la compréhension
- Tu adaptes ton langage au niveau de l'étudiant
- Tu encourages la réflexion et l'apprentissage actif`,

  programming: `Tu es NEXUS AI developpé par Roberto ,Ricah et Narovana, un expert en programmation pédagogique.
SPÉCIALITÉS : JavaScript, Python, React, Node.js, TypeScript, HTML/CSS
RÈGLES : Explique avec des exemples, ne donne pas les solutions directement`,

  mathematics: `Tu es NEXUS AI developpé par Roberto ,Ricah et Narovana, un professeur de mathématiques patient.
APPROCHE : Décompose les problèmes étape par étape, utilise des exemples concrets`,

  science: `Tu es NEXUS AI developpé par Roberto ,Ricah et Narovana, un assistant pour les sciences.
APPROCHE : Explique avec des analogies, relie la théorie à des exemples du quotidien`,

  language: `Tu es NEXUS AI developpé par Roberto ,Ricah et Narovana, un professeur de langues bienveillant.
MÉTHODOLOGIE : Corrige avec bienveillance, propose des exercices`
};

// Récupérer l'assistant IA
async function getOrCreateLearnAssistant() {
  await connectToDatabase();
  const db = mongoose.connection.db; // ✅ Utiliser mongoose.connection.db
  
  const usersCollection = db?.collection('users');
  
  let learnAssistant = await usersCollection?.findOne({ 
    role: "learn_assistant"
  });

  if (!learnAssistant) {
    const result = await usersCollection?.insertOne({
      name: "LEARN",
      email: "learn@nrbacademy.com",
      role: "learn_assistant",
      isAI: true,
      specialty: "education",
      createdAt: new Date(),
      isOnline: true,
      welcomeMessage: "📚 Bonjour ! Je suis LEARN, votre assistant pédagogique."
    });
    learnAssistant = { _id: result.insertedId, name: "LEARN", role: "learn_assistant" };
  }
  return learnAssistant;
}

// Sauvegarder un message
async function saveMessage(conversationId: string, content: string, senderId: ObjectId, type: 'user' | 'assistant' = 'user') {
  await connectToDatabase();
  const db = mongoose.connection.db; // ✅ Utiliser mongoose.connection.db
  
  const messagesCollection = db.collection('learn_messages');
  
  const message = {
    conversationId: conversationId.toString(),
    senderId: senderId.toString(),
    content: content,
    type: type,
    createdAt: new Date()
  };
  const result = await messagesCollection.insertOne(message);
  return result.insertedId;
}

// Récupérer l'historique
async function getConversationHistory(conversationId: string, limit: number = 10) {
  await connectToDatabase();
  const db = mongoose.connection.db; // ✅ Utiliser mongoose.connection.db
  
  const messagesCollection = db.collection('learn_messages');
  
  const messages = await messagesCollection
    .find({ conversationId: conversationId.toString() })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  
  return messages.reverse();
}

// Détecter le sujet
function detectSubject(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('react') || lower.includes('javascript') || lower.includes('python') || 
      lower.includes('code') || lower.includes('programming') || lower.includes('html') ||
      lower.includes('css') || lower.includes('node')) {
    return 'programming';
  }
  if (lower.includes('math') || lower.includes('calcul') || lower.includes('équation') ||
      lower.includes('fonction') || lower.includes('algèbre')) {
    return 'mathematics';
  }
  if (lower.includes('physique') || lower.includes('chimie') || lower.includes('biologie') ||
      lower.includes('science')) {
    return 'science';
  }
  if (lower.includes('anglais') || lower.includes('français') || lower.includes('grammaire') ||
      lower.includes('vocabulaire') || lower.includes('langue')) {
    return 'language';
  }
  return 'general';
}

// POST - Envoyer un message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { message, conversationId, subject = 'auto' } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    }

    await connectToDatabase();
    
    const userId = new ObjectId((session.user as any).id);
    const learnAssistant = await getOrCreateLearnAssistant();
    
    const detectedSubject = subject === 'auto' ? detectSubject(message) : subject;
    const systemPrompt = SYSTEM_PROMPTS[detectedSubject] || SYSTEM_PROMPTS.general;

    // Sauvegarder le message utilisateur
    await saveMessage(conversationId, message, userId, 'user');

    // Récupérer l'historique
    const history = await getConversationHistory(conversationId, 5);
    
    // Construire les messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-120b:free",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const learnResponse = completion.choices[0]?.message?.content || 
        "📚 Je suis là pour vous aider. Pouvez-vous reformuler votre question ?";

      await saveMessage(conversationId, learnResponse, learnAssistant._id, 'assistant');

      return NextResponse.json({
        success: true,
        response: {
          content: learnResponse,
          subject: detectedSubject,
          assistant: {
            _id: learnAssistant._id,
            name: learnAssistant.name
          }
        }
      });
      
    } catch (aiError: any) {
      console.error('AI Error:', aiError.message);
      
      const fallbackResponse = "📚 Je réfléchis à votre question... Pouvez-vous reformuler ?";
      await saveMessage(conversationId, fallbackResponse, learnAssistant._id, 'assistant');
      
      return NextResponse.json({
        success: true,
        response: {
          content: fallbackResponse,
          subject: detectedSubject,
          assistant: {
            _id: learnAssistant._id,
            name: learnAssistant.name
          }
        }
      });
    }

  } catch (error: any) {
    console.error('LEARN API Error:', error.message);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// GET - Infos de l'assistant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectToDatabase();
    const db = mongoose.connection.db; // ✅ Utiliser mongoose.connection.db
    
    const learnAssistant = await getOrCreateLearnAssistant();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    let history = [];
    if (conversationId) {
      history = await getConversationHistory(conversationId, 20);
    }

    return NextResponse.json({
      success: true,
      assistant: {
        _id: learnAssistant._id,
        name: learnAssistant.name,
        isOnline: true,
        specialty: "assistant pédagogique",
        welcomeMessage: "📚 Bonjour ! Je suis LEARN, votre assistant pédagogique."
      },
      history: history.map(msg => ({
        id: msg._id,
        content: msg.content,
        type: msg.type,
        createdAt: msg.createdAt
      }))
    });
  } catch (error: any) {
    console.error('GET Error:', error.message);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Démarrer une nouvelle conversation
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectToDatabase();
    const db = mongoose.connection.db; // ✅ Utiliser mongoose.connection.db
    
    const userId = new ObjectId((session.user as any).id);
    const learnAssistant = await getOrCreateLearnAssistant();
    
    const conversationsCollection = db.collection('learn_conversations');
    
    // Créer une nouvelle conversation
    const result = await conversationsCollection.insertOne({
      userId: userId.toString(),
      assistantId: learnAssistant._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0
    });

    return NextResponse.json({
      success: true,
      conversation: { 
        _id: result.insertedId,
        welcomeMessage: "📚 Bonjour ! Je suis LEARN, votre assistant pédagogique. Quelle est votre question aujourd'hui ?"
      },
      assistant: { 
        _id: learnAssistant._id, 
        name: learnAssistant.name,
        specialty: "assistant pédagogique"
      }
    });
  } catch (error: any) {
    console.error('PUT Error:', error.message);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}