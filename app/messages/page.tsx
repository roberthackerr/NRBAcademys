// app/messages/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageList, Conversation } from "@/components/MessageList";
import { ChatWindow, Message, ChatContact } from "@/components/ChatWindow";
import { Input } from "@/components/ui/input";
import { Search, MessageSquarePlus, Loader2, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Navbar } from "@/components/nav";
import { LearnChatbot } from "@/components/chat/LearnChatbot";

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotConversationId, setChatbotConversationId] = useState<string | null>(null);
  const [chatbotMessages, setChatbotMessages] = useState<Message[]>([]);

  // Assistant LEARN comme contact spécial
  const learnContact: ChatContact = {
    id: "learn-assistant",
    name: "LEARN Assistant",
    role: "assistant",
    avatar: "/learn-avatar.png",
    online: true,
    isAI: true,
    specialty: "assistant pédagogique"
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchConversations();
      startChatbotConversation();
    }
  }, [status, router]);

  const startChatbotConversation = async () => {
    try {
      const res = await fetch('/api/learn/chat', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setChatbotConversationId(data.conversation._id);
        setChatbotMessages([
          {
            id: Date.now().toString(),
            content: data.conversation.welcomeMessage,
            sender: "assistant",
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            read: true,
          }
        ]);
      }
    } catch (error) {
      console.error('Error starting chatbot conversation:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const userId = (session?.user as any)?.id;
      const res = await fetch(`/api/messages/conversations?userId=${userId}`);
      
      if (!res.ok) throw new Error("Erreur lors du chargement");
      
      const data = await res.json();
      
      // Ajouter la conversation avec LEARN si elle existe
      const learnConversation = {
        id: "learn-assistant",
        name: "LEARN Assistant",
        role: "assistant",
        avatar: "/learn-avatar.png",
        lastMessage: "Posez-moi vos questions sur vos cours !",
        timestamp: "En ligne",
        unread: 0,
        online: true,
        isAI: true,
        participantId: "learn-assistant"
      };
      
      setConversations([learnConversation, ...data.conversations]);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Erreur lors du chargement des conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const userId = (session?.user as any)?.id;
      const res = await fetch(`/api/messages/${conversationId}?userId=${userId}`);
      
      if (!res.ok) throw new Error("Erreur lors du chargement des messages");
      
      const data = await res.json();
      setMessages(prev => ({
        ...prev,
        [conversationId]: data.messages
      }));
      
      await markAsRead(conversationId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erreur lors du chargement des messages");
    }
  };

  const sendChatbotMessage = async (content: string) => {
    if (!chatbotConversationId) return;
    
    setSending(true);
    
    // Ajouter le message utilisateur localement
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "me",
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      read: true,
    };
    
    setChatbotMessages(prev => [...prev, userMessage]);
    
    try {
      const res = await fetch('/api/learn/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: chatbotConversationId,
          subject: 'auto'
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: data.response.messageId,
          content: data.response.content,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          read: true,
        };
        
        setChatbotMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending chatbot message:', error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      const userId = (session?.user as any)?.id;
      await fetch(`/api/messages/${conversationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unread: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !content.trim()) return;
    
    // Si c'est le chatbot
    if (selectedConversationId === "learn-assistant") {
      await sendChatbotMessage(content);
      return;
    }
    
    setSending(true);
    
    try {
      const userId = (session?.user as any)?.id;
      const res = await fetch(`/api/messages/${selectedConversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content,
          receiverId: conversations.find(c => c.id === selectedConversationId)?.participantId
        })
      });
      
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      
      const data = await res.json();
      
      const newMessage: Message = {
        id: data.message._id,
        content,
        sender: "me",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage]
      }));
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversationId
            ? { ...conv, lastMessage: content, timestamp: "À l'instant" }
            : conv
        )
      );
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowChatbot(id === "learn-assistant");
    
    if (id === "learn-assistant") {
      // Pour le chatbot, on utilise les messages stockés séparément
      if (chatbotMessages.length === 0 && chatbotConversationId) {
        startChatbotConversation();
      }
    } else if (!messages[id]) {
      fetchMessages(id);
    } else {
      markAsRead(id);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  
  const getChatContact = (): ChatContact | undefined => {
    if (selectedConversationId === "learn-assistant") {
      return learnContact;
    }
    return selectedConversation
      ? {
          id: selectedConversation.id,
          name: selectedConversation.name,
          role: selectedConversation.role,
          avatar: selectedConversation.avatar,
          online: selectedConversation.online,
        }
      : undefined;
  };

  const getCurrentMessages = (): Message[] => {
    if (selectedConversationId === "learn-assistant") {
      return chatbotMessages;
    }
    return messages[selectedConversationId!] || [];
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  const chatContact = getChatContact();
  const currentMessages = getCurrentMessages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
    
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-96 bg-white/5 backdrop-blur-xl border-r border-cyan-500/30 flex flex-col">
          <div className="p-4 border-b border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Messagerie
              </h1>
              <Button size="icon" variant="ghost" className="text-cyan-400 hover:bg-cyan-500/10">
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
              <Input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-cyan-950/20 border-cyan-500/30 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <MessageList
            conversations={filteredConversations}
            selectedId={selectedConversationId || undefined}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {chatContact ? (
            <ChatWindow
              contact={chatContact}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              sending={sending}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                  <MessageSquarePlus className="h-10 w-10 text-cyan-400" />
                </div>
                <p className="text-lg text-slate-400">Sélectionnez une conversation pour commencer</p>
                <p className="text-sm text-slate-500 mt-1">
                  Ou discutez avec <span className="text-cyan-400">LEARN Assistant</span> pour vos questions pédagogiques
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Chatbot Button (optionnel) */}
      <LearnChatbot />
    </div>
  );
}