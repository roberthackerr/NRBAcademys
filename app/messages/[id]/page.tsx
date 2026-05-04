// app/messages/[id]/page.tsx
"use client"

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video,
  Loader2,
  CheckCheck,
  Check,
  User,
  Clock,
  Trash2,
  Flag,
  Copy,
  Reply,
  Smile,
  MessageCircle,
  Bell,
  Network,
  Radio,
  Zap,
  Crown,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
  };
  read: boolean;
  readAt?: Date;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  online?: boolean;
  lastSeen?: Date;
}

export default function ConversationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchConversation();
      fetchMessages();
      
      intervalRef.current = setInterval(() => {
        fetchMessages(false);
      }, 3000);
      
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [status, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchConversation = async () => {
    try {
      const userId = (session?.user as any)?.id;
      const res = await fetch(`/api/messages/conversation/${conversationId}?userId=${userId}`);
      
      if (!res.ok) throw new Error("Erreur lors du chargement");
      
      const data = await res.json();
      setOtherUser(data.user);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast.error("Erreur lors du chargement de la conversation");
    }
  };

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    
    try {
      const userId = (session?.user as any)?.id;
      const res = await fetch(`/api/messages/${conversationId}?userId=${userId}`);
      
      if (!res.ok) throw new Error("Erreur lors du chargement");
      
      const data = await res.json();
      setMessages(data.messages);
      
      await markMessagesAsRead();
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const userId = (session?.user as any)?.id;
      await fetch(`/api/messages/${conversationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    
    try {
      const userId = (session?.user as any)?.id;
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content: newMessage.trim(),
          receiverId: conversationId
        })
      });
      
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      
      const data = await res.json();
      
      setMessages(prev => [...prev, data.message]);
      setNewMessage("");
      scrollToBottom();
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 1000);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const userId = (session?.user as any)?.id;
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      
      setMessages(prev => prev.filter(m => m._id !== messageId));
      toast.success("Message supprimé");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Message copié");
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const diffHours = diff / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } else if (diffHours < 48) {
      return "Hier " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } else {
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    }
  };

  const formatDateGroup = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return "Aujourd'hui";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Hier";
    } else {
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    }
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt);
      const dateKey = date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "instructor": return "from-cyan-500 to-violet-600";
      case "admin": return "from-amber-500 to-orange-600";
      default: return "from-emerald-500 to-teal-600";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "instructor": return "Enseignant";
      case "admin": return "Admin";
      default: return "Étudiant";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();
  const userId = (session?.user as any)?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
      <div className="flex flex-col h-screen max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-cyan-500/30 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="rounded-full text-cyan-400 hover:bg-cyan-500/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-cyan-500/30 shadow-lg">
                <AvatarImage src={otherUser?.avatar} />
                <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(otherUser?.role || "student")} text-white`}>
                  {otherUser?.name?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {otherUser?.online && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-[#0d0d35] rounded-full" />
              )}
            </div>
            
            <div>
              <h2 className="font-semibold text-white">{otherUser?.name}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs bg-gradient-to-r ${getRoleColor(otherUser?.role || "student")} text-white border-0`}>
                  {getRoleLabel(otherUser?.role || "student")}
                </Badge>
                {otherUser?.online ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    En ligne
                  </span>
                ) : otherUser?.lastSeen ? (
                  <span className="text-xs text-slate-400">
                    Vu le {new Date(otherUser.lastSeen).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full text-cyan-400 hover:bg-cyan-500/10">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-cyan-400 hover:bg-cyan-500/10">
              <Video className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-cyan-400 hover:bg-cyan-500/10">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0d0d35] border border-cyan-500/30">
                <DropdownMenuItem className="text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10">
                  <User className="h-4 w-4 mr-2" />
                  Voir le profil
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10">
                  <Bell className="h-4 w-4 mr-2" />
                  Activer les notifications
                </DropdownMenuItem>
                <DropdownMenuItem className="text-rose-400 hover:bg-rose-500/10">
                  <Flag className="h-4 w-4 mr-2" />
                  Signaler
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30">
                <MessageCircle className="h-10 w-10 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white">Aucun message</h3>
              <p className="text-sm text-slate-400 mt-1">
                Envoyez un message pour démarrer la conversation
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
                <div key={dateKey}>
                  <div className="flex justify-center mb-4">
                    <Badge variant="secondary" className="text-xs bg-white/5 text-slate-400 border border-cyan-500/30">
                      {formatDateGroup(dateMessages[0].createdAt)}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {dateMessages.map((message, idx) => {
                      const isMe = message.sender._id === userId;
                      const showAvatar = !isMe && (idx === 0 || 
                        dateMessages[idx - 1]?.sender._id !== message.sender._id);
                      
                      return (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                            {showAvatar && (
                              <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                                <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(otherUser?.role || "student")} text-white text-xs`}>
                                  {otherUser?.name?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className="group relative">
                              <div
                                className={`rounded-2xl px-4 py-2.5 shadow-lg ${
                                  isMe
                                    ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white"
                                    : "bg-white/5 text-slate-200 border border-cyan-500/30"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <div
                                  className={`flex items-center gap-1 mt-1 text-xs ${
                                    isMe ? "text-cyan-200" : "text-slate-400"
                                  }`}
                                >
                                  <span>{formatTime(message.createdAt)}</span>
                                  {isMe && (
                                    <span>
                                      {message.read ? (
                                        <CheckCheck className="h-3 w-3" />
                                      ) : (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-2 -right-8 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-950/50 text-cyan-400"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[160px] bg-[#0d0d35] border border-cyan-500/30">
                                  <DropdownMenuItem onClick={() => copyMessage(message.content)} className="text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10">
                                    <Reply className="h-4 w-4 mr-2" />
                                    Répondre
                                  </DropdownMenuItem>
                                  {isMe && (
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteMessage(message._id)}
                                      className="text-rose-400 hover:bg-rose-500/10"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl px-4 py-2.5 border border-cyan-500/30">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        {/* Input */}
        <div className="p-4 bg-white/5 backdrop-blur-xl border-t border-cyan-500/30">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 rounded-full text-cyan-400 hover:bg-cyan-500/10">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder="Écrivez votre message..."
                className="rounded-full px-4 py-2 bg-cyan-950/20 border-cyan-500/30 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500"
                disabled={sending}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 shadow-lg shadow-cyan-500/25"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Appuyez sur Entrée pour envoyer
          </p>
        </div>
      </div>
    </div>
  );
}