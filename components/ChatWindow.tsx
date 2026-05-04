// components/ChatWindow.tsx
"use client"

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video, 
  Loader2, 
  MessageCircle,
  Bot,
  Sparkles,
  Zap,
  Crown,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface Message {
  id: string;
  content: string;
  sender: "me" | "other";
  timestamp: string;
  read: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  role: "student" | "professor" | "admin" | "assistant";
  avatar?: string;
  online: boolean;
  isAI?: boolean;
  specialty?: string;
}

interface ChatWindowProps {
  contact: ChatContact;
  messages: Message[];
  onSendMessage: (content: string) => void;
  sending?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

export function ChatWindow({ 
  contact, 
  messages, 
  onSendMessage, 
  sending = false,
  onTyping 
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() && !sending) {
      onSendMessage(newMessage);
      setNewMessage("");
      handleStopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  const getRoleColor = (role: string, isAI?: boolean) => {
    if (isAI) return "from-cyan-500 to-violet-600";
    switch (role) {
      case "professor":
        return "from-blue-500 to-cyan-600";
      case "admin":
        return "from-purple-500 to-pink-600";
      default:
        return "from-emerald-500 to-teal-600";
    }
  };

  const getRoleLabel = (role: string, isAI?: boolean) => {
    if (isAI) return "Assistant IA";
    switch (role) {
      case "professor":
        return "Enseignant";
      case "admin":
        return "Administrateur";
      default:
        return "Étudiant";
    }
  };

  const getRoleIcon = (role: string, isAI?: boolean) => {
    if (isAI) return <Bot className="h-4 w-4" />;
    switch (role) {
      case "professor":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    if (timestamp === "À l'instant") return timestamp;
    return timestamp;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0d0d35] to-[#0a0a2e]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-cyan-500/30 shadow-lg">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback className={cn(
                "bg-gradient-to-br text-white font-semibold",
                getRoleColor(contact.role, contact.isAI)
              )}>
                {contact.isAI ? (
                  <Bot className="h-6 w-6" />
                ) : (
                  contact.name.slice(0, 2).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            {contact.online && (
              <>
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0d0d35] rounded-full" />
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
              </>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white">{contact.name}</h2>
              {contact.isAI && (
                <Badge className="text-xs bg-gradient-to-r from-cyan-500 to-violet-600 text-white border-0">
                  {getRoleIcon(contact.role, contact.isAI)}
                  <span className="ml-1">IA</span>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className={cn(
                "text-xs border-0",
                getRoleColor(contact.role, contact.isAI),
                "bg-opacity-20 text-white"
              )}>
                {getRoleIcon(contact.role, contact.isAI)}
                <span className="ml-1">{getRoleLabel(contact.role, contact.isAI)}</span>
              </Badge>
              {contact.online ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  En ligne
                </span>
              ) : (
                <span className="text-xs text-slate-400">Hors ligne</span>
              )}
            </div>
            {contact.specialty && (
              <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {contact.specialty}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hover:bg-cyan-500/10 rounded-full text-cyan-400">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-cyan-500/10 rounded-full text-cyan-400">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-cyan-500/10 rounded-full text-cyan-400">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30">
              <MessageCircle className="h-10 w-10 text-cyan-400" />
            </div>
            <p className="text-white font-medium">Aucun message</p>
            <p className="text-sm text-slate-400 mt-1">
              Envoyez un message pour démarrer la conversation
            </p>
            {contact.isAI && (
              <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Je suis là pour vous aider avec vos questions
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const showAvatar = message.sender === "other" && 
                (index === 0 || messages[index - 1]?.sender !== "other");
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    message.sender === "me" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex gap-2 max-w-[75%]",
                    message.sender === "me" ? "flex-row-reverse" : "flex-row"
                  )}>
                    {showAvatar && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback className={cn(
                          "bg-gradient-to-br text-white text-xs",
                          getRoleColor(contact.role, contact.isAI)
                        )}>
                          {contact.isAI ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            contact.name.slice(0, 2).toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 shadow-lg",
                        message.sender === "me"
                          ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white"
                          : "bg-white/5 text-slate-200 border border-cyan-500/30"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1 text-xs",
                          message.sender === "me" ? "text-cyan-200" : "text-slate-400"
                        )}
                      >
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender === "me" && (
                          <span>
                            {message.read ? (
                              <span className="text-cyan-300">✓✓</span>
                            ) : (
                              <span>✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Indicateur de frappe */}
            {isTyping && (
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
      <div className="p-4 border-t border-cyan-500/30 bg-white/5 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 hover:bg-cyan-500/10 rounded-full text-cyan-400"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder={contact.isAI ? "Posez votre question..." : "Écrivez votre message..."}
              className="flex-1 rounded-full px-4 py-2 bg-cyan-950/20 border border-cyan-500/30 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500"
              disabled={sending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 shadow-lg shadow-cyan-500/25 transition-all"
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
        {contact.isAI && (
          <p className="text-xs text-cyan-400/70 mt-1 text-center flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            Je vous guide sans donner les réponses directement
          </p>
        )}
      </div>
    </div>
  );
}