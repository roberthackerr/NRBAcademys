// app/learn-ai/page.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Bot, Send, Loader2, Sparkles, Zap, Brain, 
  Code, Calculator, Globe, BookOpen, GraduationCap,
  Database, Cpu, Cloud, Shield, Rocket, Infinity,
  Network, Radio, Target, Award, Crown, Gem,
  Menu, X, Clock, CheckCircle2, ThumbsUp, ThumbsDown,
  Copy, Share2, Volume2, VolumeX, Maximize2, Minimize2,
  User, Hexagon, Diamond, Orbit, Star, Waves, 
  Atom, Fingerprint, Eye, Mic, MicOff, CornerDownLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  createdAt: Date;
  subject?: string;
  isTyping?: boolean;
}

interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  glowColor: string;
  description: string;
}

const subjects: Subject[] = [
  { id: 'auto', name: 'Auto', icon: <Sparkles className="h-5 w-5" />, color: 'cyan', gradient: 'from-cyan-400 to-blue-500', glowColor: '#00ffff', description: 'Détection automatique' },
  { id: 'programming', name: 'Code', icon: <Code className="h-5 w-5" />, color: 'blue', gradient: 'from-blue-500 to-indigo-600', glowColor: '#3b82f6', description: 'Programmation' },
  { id: 'mathematics', name: 'Math', icon: <Calculator className="h-5 w-5" />, color: 'purple', gradient: 'from-purple-500 to-pink-500', glowColor: '#a855f7', description: 'Mathématiques' },
  { id: 'science', name: 'Science', icon: <Atom className="h-5 w-5" />, color: 'green', gradient: 'from-emerald-500 to-teal-500', glowColor: '#10b981', description: 'Sciences' },
  { id: 'language', name: 'Langue', icon: <Globe className="h-5 w-5" />, color: 'amber', gradient: 'from-amber-500 to-orange-500', glowColor: '#f59e0b', description: 'Langues' },
];

const quickQuestions = [
  { icon: <Code className="h-4 w-4" />, text: "Comment débuter en programmation ?", color: "blue" },
  { icon: <Calculator className="h-4 w-4" />, text: "Comment résoudre une équation ?", color: "purple" },
  { icon: <Atom className="h-4 w-4" />, text: "Explique-moi la photosynthèse", color: "green" },
  { icon: <Globe className="h-4 w-4" />, text: "Comment apprendre l'anglais ?", color: "amber" },
  { icon: <Brain className="h-4 w-4" />, text: "C'est quoi l'intelligence artificielle ?", color: "cyan" },
  { icon: <Database className="h-4 w-4" />, text: "Comment analyser des données ?", color: "blue" },
];

const typingMessages = [
  "Analyse en cours...",
  "Traitement de votre requête...",
  "Recherche dans la base de connaissances...",
  "Génération de la réponse...",
  "Optimisation de la réponse...",
];

export default function LearnAIPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('auto');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [typingMessageIndex, setTypingMessageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effets visuels
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else if (hour < 22) setTimeOfDay('evening');
    else setTimeOfDay('night');
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      startConversation();
    }
  }, [status, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setTypingMessageIndex((prev) => (prev + 1) % typingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

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
            content: `✨ Bonjour ! Je suis **LEARN**, votre assistant pédagogique augmenté par IA. ${timeOfDay === 'morning' ? 'Bon début de journée !' : timeOfDay === 'evening' ? 'Belle soirée !' : 'Bonjour !'} Je suis là pour vous guider dans votre apprentissage avec intelligence et bienveillance. Que souhaitez-vous explorer aujourd'hui ?`,
            type: 'assistant',
            createdAt: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Erreur de connexion');
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

    const typingMessage: Message = {
      id: 'typing',
      content: '',
      type: 'assistant',
      createdAt: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

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
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      if (data.success) {
        const assistantMessage: Message = {
          id: data.response.messageId || Date.now().toString(),
          content: data.response.content,
          type: 'assistant',
          createdAt: new Date(),
          subject: data.response.subject
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (!isMuted) {
          const audio = new Audio('data:audio/wav;base64,U3RlYWx0aCBpcyB0aGUgYmVzdA');
          audio.volume = 0.1;
          audio.play().catch(() => {});
        }
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copié !');
  };

  const getSubjectConfig = (subjectId: string) => subjects.find(s => s.id === subjectId) || subjects[0];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500 rounded-full blur-3xl animate-ping opacity-20" />
          <div className="relative w-20 h-20 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* === BACKGROUND CINEMATIQUE === */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Gradient dynamique */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] opacity-90" />
        
        {/* Grille holographique animée */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 animate-pulse" />
        
        {/* Mouvement oculaire - Cursor effect */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-500/10 to-violet-500/10 blur-3xl transition-all duration-500 pointer-events-none"
          style={{ left: mousePosition.x - 300, top: mousePosition.y - 300 }}
        />
        
        {/* Orbes lumineux */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        
        {/* Particules flottantes */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`,
              animation: `float ${3 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3 + Math.random() * 0.5
            }}
          />
        ))}
        
        {/* Anneaux holographiques */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-cyan-500/10 animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-violet-500/10 animate-spin-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-cyan-500/5 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        
        {/* Étoiles scintillantes */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-screen">
        {/* === SIDEBAR FUTURISTIQUE === */}
        <motion.aside
          initial={{ width: 300 }}
          animate={{ width: isSidebarOpen ? 300 : 0 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="hidden lg:block bg-black/40 backdrop-blur-2xl border-r border-white/10 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600">
                      <Hexagon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    Nexus IA
                  </h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-xl blur" />
                <div className="relative bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Session en cours</p>
                  <p className="text-white font-medium text-sm">{session?.user?.name || 'Invité'}</p>
                  <p className="text-xs text-slate-400 mt-1">Niveau: Expert IA</p>
                  <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats IA */}
            <div className="p-6 border-b border-white/10">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-2xl font-bold text-cyan-400">{messages.filter(m => m.type === 'assistant' && !m.isTyping).length}</p>
                  <p className="text-xs text-slate-400">Messages échangés</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-2xl font-bold text-violet-400">{Math.floor(messages.length * 0.85)}%</p>
                  <p className="text-xs text-slate-400">Précision IA</p>
                </div>
              </div>
            </div>

            {/* Spécialités */}
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-xs text-cyan-400 uppercase tracking-wider mb-4">Spécialités IA</p>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <motion.button
                    key={subject.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all relative overflow-hidden group",
                      selectedSubject === subject.id 
                        ? `bg-gradient-to-r ${subject.gradient} shadow-lg`
                        : "bg-white/5 hover:bg-white/10"
                    )}
                    style={selectedSubject === subject.id ? { boxShadow: `0 0 30px ${subject.glowColor}40` } : {}}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white/10 to-transparent" />
                    <div className="relative z-10 flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg transition-all",
                        selectedSubject === subject.id ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                      )}>
                        {subject.icon}
                      </div>
                      <span className={cn("font-semibold", selectedSubject === subject.id ? "text-white" : "text-slate-300")}>
                        {subject.name}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer sidebar */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Orbit className="h-3 w-3" />
                <span>IA v4.2.0 • État: Connecté</span>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* === MAIN CHAT AREA === */}
        <div className="flex-1 flex flex-col relative">
          {/* Header futuriste */}
          <div className="bg-black/30 backdrop-blur-2xl border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition">
                  <Menu className="h-5 w-5 text-cyan-400" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl animate-pulse" />
                    <div className="relative p-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                      LEARN AI • Nexus
                    </h1>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Actif</span>
                      </div>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Modèle: GPT-4 Turbo</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-cyan-400">Latence: 120ms</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => setIsVoiceInput(!isVoiceInput)} className="p-2 rounded-lg hover:bg-white/10 transition">
                  {isVoiceInput ? <Mic className="h-4 w-4 text-red-400 animate-pulse" /> : <MicOff className="h-4 w-4 text-slate-400" />}
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-lg hover:bg-white/10 transition">
                  {isMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
                </button>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-lg hover:bg-white/10 transition">
                  {isFullscreen ? <Minimize2 className="h-4 w-4 text-cyan-400" /> : <Maximize2 className="h-4 w-4 text-cyan-400" />}
                </button>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <div className="flex items-center gap-1 text-xs font-mono">
                  <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                  <span className="text-cyan-400/70">SECURE • ENCRYPTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05, type: 'spring' }}
                  onHoverStart={() => setHoveredMessage(message.id)}
                  onHoverEnd={() => setHoveredMessage(null)}
                  className={`group flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.isTyping ? (
                    <div className="bg-white/5 rounded-2xl p-5 border border-cyan-500/30 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <p className="text-xs text-cyan-400">{typingMessages[typingMessageIndex]}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`flex gap-4 max-w-[75%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          message.type === 'user'
                            ? "bg-gradient-to-r from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/25"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500"
                        )}>
                          {message.type === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
                        </div>
                        
                        <div className="relative">
                          <motion.div
                            className="relative"
                            animate={message.type === 'assistant' ? {
                              boxShadow: [
                                '0 0 0px rgba(0,255,255,0)',
                                '0 0 20px rgba(0,255,255,0.3)',
                                '0 0 0px rgba(0,255,255,0)'
                              ]
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className={cn(
                              "p-4 rounded-2xl backdrop-blur-sm",
                              message.type === 'user'
                                ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-tr-sm"
                                : "bg-white/10 text-slate-200 rounded-tl-sm border border-white/20"
                            )}>
                              <div className="prose prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {message.content.split('**').map((part, i) => 
                                    i % 2 === 1 ? <strong key={i} className="text-cyan-400">{part}</strong> : part
                                  )}
                                </p>
                              </div>
                              {message.subject && message.subject !== 'auto' && message.type === 'assistant' && (
                                <div className="mt-2">
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full bg-gradient-to-r text-white/80",
                                    getSubjectConfig(message.subject).gradient
                                  )}>
                                    {getSubjectConfig(message.subject).name}
                                  </span>
                                </div>
                              )}
                              <div className={cn(
                                "flex items-center gap-2 mt-2 text-xs",
                                message.type === 'user' ? "text-cyan-200" : "text-slate-500"
                              )}>
                                <Clock className="h-3 w-3" />
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </motion.div>
                          
                          {/* Actions */}
                          <AnimatePresence>
                            {hoveredMessage === message.id && message.type === 'assistant' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                className="absolute -bottom-3 -right-3 flex gap-1"
                              >
                                <button onClick={() => copyMessage(message.content)} className="p-1.5 rounded-lg bg-black/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition backdrop-blur-sm">
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button className="p-1.5 rounded-lg bg-black/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition backdrop-blur-sm">
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button className="p-1.5 rounded-lg bg-black/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition backdrop-blur-sm">
                                  <Share2 className="h-3 w-3" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                    <p className="text-xs text-slate-400">LEARN analyse votre question...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area futuriste */}
          <div className="border-t border-white/10 bg-black/30 backdrop-blur-2xl p-4">
            <div className="max-w-5xl mx-auto">
              {/* Quick Questions */}
              {messages.length === 0 && (
                <div className="mb-4">
                  <p className="text-xs text-cyan-400 mb-3 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    QUESTIONS FRÉQUENTES
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setInput(q.text)}
                        className={cn(
                          "px-3 py-2 rounded-full bg-white/5 text-xs transition-all flex items-center gap-2 border border-white/10",
                          `hover:border-${q.color}-500/50 hover:shadow-lg hover:shadow-${q.color}-500/25`
                        )}
                      >
                        {q.icon}
                        {q.text}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-50" />
                <div className="relative flex gap-3 bg-black/50 border border-white/20 rounded-2xl p-2 backdrop-blur-sm">
                  <div className="flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isVoiceInput ? "Parlez maintenant..." : "Posez votre question..."}
                      className="w-full px-5 py-3 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-500 hidden sm:block">
                      <div className="flex items-center gap-1">
                        <CornerDownLeft className="h-3 w-3" />
                        Entrer
                      </div>
                    </div>
                    <div className="w-px h-6 bg-white/20" />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Shield className="h-3 w-3" />
                    <span>Chiffrement de bout en bout</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Infinity className="h-3 w-3" />
                    <span>Apprentissage continu</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Brain className="h-3 w-3" />
                    <span>Modèle: GPT-4 Turbo</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Fingerprint className="h-3 w-3" />
                    <span>Session sécurisée</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 15s linear infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}