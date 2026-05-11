// app/student/layout.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard, BookOpen, FileText, Users, Calendar,
  Settings, LogOut, Menu, X, ChevronRight, Bell, User,
  GraduationCap, Award, TrendingUp, MessageSquare, HelpCircle,
  ChevronLeft, Home, Sparkles, Crown, Trophy, BarChart3,
  Network, Radio, Zap, PlayCircle, Clock, Star, Target
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/student',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Mes cours',
    href: '/student/courses',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: 'Mes devoirs',
    href: '/student/assignments',
    icon: <FileText className="h-5 w-5" />,
  },

  {
    title: 'Certificats',
    href: '/student/certificates',
    icon: <Award className="h-5 w-5" />,
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: <MessageSquare className="h-5 w-5" />,
  },

];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  // Vérifier l'authentification et le rôle
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user && (session.user as any).role !== 'student') {
      router.push('/');
    }
  }, [session, status, router]);

  // Fermer le menu mobile sur changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Vérifier si un lien est actif
  const isActive = (href: string) => {
    if (href === '/student') {
      return pathname === '/student';
    }
    return pathname.startsWith(href);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] relative overflow-hidden">
      {/* Holographic Grid Background */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0, 255, 255, 0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Animated Glow Orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar Desktop */}
        <motion.aside
          initial={{ width: sidebarOpen ? 280 : 80 }}
          animate={{ width: sidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hidden md:block fixed left-0 top-0 h-full bg-white/5 backdrop-blur-xl border-r border-cyan-500/30 z-30 overflow-hidden"
        >
          {/* Logo Section */}
          <div className="flex items-center justify-between p-5 border-b border-cyan-500/30">
            <Link href="/student" className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent"
                >
                  ESPACE ÉTUDIANT
                </motion.span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <ChevronLeft className={`h-4 w-4 text-cyan-400 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-cyan-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'E'}
                </span>
              </div>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-white font-medium text-sm truncate">
                    {session?.user?.name || 'Étudiant'}
                  </p>
                  <p className="text-cyan-400 text-xs truncate">Apprenant</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </div>
                {sidebarOpen && item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/30 bg-white/5 backdrop-blur-sm">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition"
            >
              <Home className="h-5 w-5" />
              {sidebarOpen && <span className="text-sm font-medium">Accueil</span>}
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-[280px]' : 'md:ml-[80px]'}`}>
          {/* Mobile Header */}
          <div className="sticky top-0 z-20 md:hidden bg-white/5 backdrop-blur-xl border-b border-cyan-500/30">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition"
              >
                <Menu className="h-5 w-5 text-cyan-400" />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
                  <Radio className="h-3 w-3" />
                  <span>ESPACE ÉTUDIANT</span>
                </div>
              </div>

              <div className="relative">
                <button className="relative p-2 rounded-lg hover:bg-white/10 transition">
                  <Bell className="h-5 w-5 text-cyan-400" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 h-full w-80 bg-white/5 backdrop-blur-xl border-r border-cyan-500/30 z-50 md:hidden overflow-y-auto"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    ESPACE ÉTUDIANT
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  <X className="h-5 w-5 text-cyan-400" />
                </button>
              </div>

              {/* Mobile User Info */}
              <div className="p-4 border-b border-cyan-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {session?.user?.name?.charAt(0).toUpperCase() || 'E'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">
                      {session?.user?.name || 'Étudiant'}
                    </p>
                    <p className="text-cyan-400 text-xs">Apprenant</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Mobile Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/30 bg-white/5">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-sm font-medium">Accueil</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}