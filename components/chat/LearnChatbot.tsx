// components/chat/LearnChatbot.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, X, Minimize2, Maximize2, 
  Bot, User, Loader2, BookOpen, Code, Calculator, 
  Globe, Sparkles, ChevronRight, Zap, Brain, GraduationCap
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  createdAt: Date;
  subject?: string;
}

interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const subjects: Subject[] = [
  { 
    id: 'auto', 
    name: 'Auto', 
    icon: <Sparkles className="h-4 w-4" />, 
    color: 'from-cyan-500 to-violet-600',
    description: 'Détection automatique'
  },
  { 
    id: 'programming', 
    name: 'Programmation', 
    icon: <Code className="h-4 w-4" />, 
    color: 'from-blue-500 to-cyan-600',
    description: 'JavaScript, Python, React, Node.js'
  },
  { 
    id: 'mathematics', 
    name: 'Mathématiques', 
    icon: <Calculator className="h-4 w-4" />, 
    color: 'from-purple-500 to-pink-600',
    description: 'Algèbre, Analyse, Géométrie'
  },
  { 
    id: 'science', 
    name: 'Sciences', 
    icon: <BookOpen className="h-4 w-4" />, 
    color: 'from-emerald-500 to-teal-600',
    description: 'Physique, Chimie, Biologie'
  },
  { 
    id: 'language', 
    name: 'Langues', 
    icon: <Globe className="h-4 w-4" />, 
    color: 'from-amber-500 to-orange-600',
    description: 'Anglais, Français, Espagnol'
  },
];

export function LearnChatbot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('auto');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !conversationId && session) {
      startConversation();
    }
  }, [isOpen, session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'assistant') {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = async () => {
    try {
      const res = await fetch('/api/learn/chat', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setConversationId(data.conversation._id);
        setMessages([
          {
            id: Date.now().toString(),
            content: data.conversation.welcomeMessage || "📚 Bonjour ! Je suis LEARN, votre assistant pédagogique. Posez-moi toutes vos questions sur vos cours !",
            type: 'assistant',
            createdAt: new Date()
          }
        ]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Erreur de connexion au chatbot');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: 'user',
      createdAt: new Date(),
      subject: selectedSubject
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/learn/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationId,
          subject: selectedSubject
        })
      });

      const data = await res.json();
      if (data.success) {
        const assistantMessage: Message = {
          id: data.response.messageId || Date.now().toString(),
          content: data.response.content,
          type: 'assistant',
          createdAt: new Date(),
          subject: data.response.subject
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetUnread = () => {
    setUnreadCount(0);
    setIsOpen(true);
  };

  if (!session) return null;

  return (
    <>
      {/* Chat Button - Responsive position */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetUnread}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-3 sm:p-4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 group"
        >
          <div className="relative">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 bg-amber-500 rounded-full text-[10px] sm:text-xs flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="absolute right-full mr-2 sm:mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            Poser une question à LEARN
          </span>
        </motion.button>
      )}

      {/* Chat Window - Responsive dimensions */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden transition-all duration-300 ${
              isMinimized 
                ? 'w-[280px] sm:w-80 h-14' 
                : 'w-[calc(100vw-32px)] sm:w-[450px] h-[500px] sm:h-[600px] max-h-[80vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-violet-600 p-3 sm:p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 rounded-xl bg-white/20">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">LEARN Assistant</h3>
                  <p className="text-cyan-200 text-[10px] sm:text-xs flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    En ligne - Assistant pédagogique
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-white/20 transition"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" /> : <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-white/20 transition"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Subject Selector - Scroll horizontal sur mobile */}
                <div className="p-2 sm:p-3 border-b border-cyan-500/30 bg-cyan-950/10">
                  <p className="text-[10px] sm:text-xs text-cyan-400 mb-1 sm:mb-2 font-mono">SPÉCIALITÉ</p>
                  <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject.id)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                          selectedSubject === subject.id
                            ? `bg-gradient-to-r ${subject.color} text-white shadow-lg`
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                        title={subject.description}
                      >
                        {subject.icon}
                        {subject.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages - Hauteur adaptative */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 h-[calc(100%-180px)] sm:h-[460px]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-1 sm:gap-2 max-w-[90%] sm:max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-cyan-500 to-violet-600'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          ) : (
                            <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          )}
                        </div>
                        <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-tr-sm'
                            : 'bg-white/5 text-slate-200 rounded-tl-sm border border-cyan-500/30'
                        }`}>
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          {message.subject && message.subject !== 'auto' && (
                            <div className="mt-1">
                              <span className={`text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full bg-white/20 text-white/70`}>
                                {subjects.find(s => s.id === message.subject)?.name}
                              </span>
                            </div>
                          )}
                          <p className="text-[10px] sm:text-xs opacity-50 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 sm:gap-2 bg-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl rounded-tl-sm border border-cyan-500/30">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400 animate-spin" />
                        <span className="text-xs sm:text-sm text-slate-400">LEARN réfléchit...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input - Compact sur mobile */}
                <div className="p-2 sm:p-4 border-t border-cyan-500/30 bg-cyan-950/10">
                  <div className="flex gap-1 sm:gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Posez votre question..."
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white placeholder:text-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:shadow-lg transition disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1 sm:mt-2">
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      LEARN vous guide sans donner les réponses
                    </p>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Zap className="h-2 w-2 sm:h-3 sm:w-3 text-cyan-400" />
                      <span className="text-[9px] sm:text-xs text-cyan-400">Pédagogie active</span>
                    </div>
                  </div>
                </div>

                {/* Quick Questions - Scroll horizontal sur mobile */}
                <div className="p-2 sm:p-3 border-t border-cyan-500/30 bg-cyan-950/5">
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-1 sm:mb-2">Questions fréquentes :</p>
                  <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
                    {[
                      "Comment fonctionne React ?",
                      "Explique-moi les promesses JS",
                      "C'est quoi l'IA ?",
                      "Apprendre Python"
                    ].map((question) => (
                      <button
                        key={question}
                        onClick={() => setInput(question)}
                        className="px-1.5 sm:px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] sm:text-xs hover:bg-cyan-500/20 transition whitespace-nowrap"
                      >
                        {question.length > 20 ? question.slice(0, 20) + '...' : question}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
