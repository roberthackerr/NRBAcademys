// components/MessageList.tsx
"use client"

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

export interface Conversation {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
  isAI?: boolean;
  participantId?: string;
}

interface MessageListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function MessageList({ conversations, selectedId, onSelect }: MessageListProps) {
  const getRoleColor = (role: string) => {
    if (role === "assistant") return "from-cyan-500 to-violet-600";
    switch (role) {
      case "instructor": return "from-purple-500 to-pink-500";
      case "admin": return "from-amber-500 to-orange-500";
      default: return "from-emerald-500 to-teal-500";
    }
  };

  const getRoleLabel = (role: string, isAI?: boolean) => {
    if (isAI) return "Assistant IA";
    switch (role) {
      case "instructor": return "Enseignant";
      case "admin": return "Admin";
      default: return "Étudiant";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            "w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-all duration-200 border-b border-cyan-500/20",
            selectedId === conv.id && "bg-gradient-to-r from-cyan-500/10 to-violet-500/10"
          )}
        >
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-cyan-500/30">
              <AvatarImage src={conv.avatar} />
              <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(conv.role)} text-white`}>
                {conv.isAI ? <Bot className="h-6 w-6" /> : conv.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {conv.online && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-[#0d0d35] rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-white truncate">{conv.name}</p>
              <span className="text-xs text-slate-400">{conv.timestamp}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-xs bg-gradient-to-r ${getRoleColor(conv.role)} text-white border-0`}>
                {getRoleLabel(conv.role, conv.isAI)}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-400 truncate mt-1">{conv.lastMessage}</p>
          </div>
          
          {conv.unread > 0 && (
            <div className="min-w-[20px] h-5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs flex items-center justify-center px-1">
              {conv.unread}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}