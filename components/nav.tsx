// components/Navbar.tsx
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { 
  GraduationCap, 
  Sparkles, 
  MessageCircle, 
  Bell, 
  User, 
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  BookOpen,
  Users,
  Home,
  Award,
  HelpCircle,
  Menu,
  X,
  Network,
  Radio,
  Zap,
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface NavbarProps {
  isAuthenticated?: boolean
  user?: {
    name: string
    avatar?: string
    unreadMessages?: number
    role?: "student" | "instructor" | "admin"
  }
}

export function Navbar({ isAuthenticated: propIsAuthenticated, user: propUser }: NavbarProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // ✅ Vérifier si on est sur une page d'auth (cacher la navbar)
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/signup/step2' || pathname === '/signup/step3'
  
  // Effet pour le scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Utiliser la session réelle ou les props
  const isAuthenticated = status === "authenticated" || propIsAuthenticated
  const sessionUser = session?.user as any
  const currentUser = propUser || (sessionUser ? {
    name: sessionUser.name,
    avatar: sessionUser.image,
    role: sessionUser.role,
    email: sessionUser.email,
    unreadMessages: 3
  } : null)
  
  const [unreadMessages, setUnreadMessages] = useState(currentUser?.unreadMessages || 0)
  const [unreadNotifications, setUnreadNotifications] = useState(2)

  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      setUnreadMessages(3)
    }
  }, [isAuthenticated, currentUser?.id])

  // ✅ Si on est sur une page d'auth, ne pas afficher la navbar
  if (isAuthPage) {
    return null
  }

  const navLinks = [
    { href: "/", label: "Accueil", icon: <Home className="h-4 w-4" /> },
    { href: "/courses", label: "Cours", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/dashboard", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/community", label: "Communauté", icon: <Users className="h-4 w-4" /> },
  ]

  const getRoleBasedLinks = () => {
    const role = currentUser?.role || sessionUser?.role
    
    switch (role) {
      case "instructor":
        return [
          { href: "/teacher", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
          { href: "/teacher/courses", label: "Mes cours", icon: <BookOpen className="h-4 w-4" /> },
          { href: "/teacher/assignments", label: "Devoirs", icon: <Award className="h-4 w-4" /> },
          { href: "/teacher/submissions", label: "Soumissions", icon: <Users className="h-4 w-4" /> },
        ]
      case "admin":
        return [
          { href: "/admin/dashboard", label: "Administration", icon: <LayoutDashboard className="h-4 w-4" /> },
          { href: "/admin/users", label: "Utilisateurs", icon: <Users className="h-4 w-4" /> },
          { href: "/admin/courses", label: "Gestion des cours", icon: <BookOpen className="h-4 w-4" /> },
          { href: "/admin/universities", label: "Universités", icon: <GraduationCap className="h-4 w-4" /> },
        ]
      default:
        return [
          { href: "/student", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
          { href: "/student/courses", label: "Mes cours", icon: <BookOpen className="h-4 w-4" /> },
          { href: "/student/progress", label: "Ma progression", icon: <Award className="h-4 w-4" /> },
          { href: "/student/assignments", label: "Devoirs", icon: <Award className="h-4 w-4" /> },
        ]
    }
  }

  const roleBasedLinks = getRoleBasedLinks()
  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "instructor": return "Enseignant"
      case "admin": return "Administrateur"
      default: return "Étudiant"
    }
  }

  if (status === "loading") {
    return (
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-cyan-500/30" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-xl">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div className="h-8 w-32 bg-cyan-500/20 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-cyan-500/20 rounded-full animate-pulse" />
        </div>
      </nav>
    )
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-black/80 backdrop-blur-xl border-b border-cyan-500/30" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="p-2 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-xl shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300"
            >
              <GraduationCap className="h-7 w-7 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                NRBAcademy
              </h1>
              <p className="text-xs text-cyan-400/70">Élevez votre apprentissage</p>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all gap-2",
                    isActive(link.href) && "text-cyan-400 bg-cyan-500/20 border border-cyan-500/30"
                  )}
                >
                  {link.icon}
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Messages Button */}
                <Link href="/messages">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative hover:bg-cyan-500/10 hover:text-cyan-400 transition-all",
                      isActive("/messages") && "text-cyan-400 bg-cyan-500/20"
                    )}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {unreadMessages > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse bg-gradient-to-r from-cyan-500 to-violet-500"
                      >
                        {unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative hover:bg-cyan-500/10 hover:text-cyan-400">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-cyan-400 rounded-full animate-pulse" />
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-cyan-500/10 pl-2 pr-1">
                      <Avatar className="h-8 w-8 border-2 border-cyan-500/30">
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-violet-600 text-white">
                          {getInitials(currentUser?.name || "Utilisateur")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-medium text-white">{currentUser?.name?.split(' ')[0]}</p>
                        <p className="text-xs text-cyan-400/70">{getRoleLabel(currentUser?.role)}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-cyan-400/70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-[#0d0d35] border border-cyan-500/30">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{currentUser?.name}</span>
                        <span className="text-xs text-cyan-400/70">
                          {getRoleLabel(currentUser?.role)} · {currentUser?.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-cyan-500/30" />
                    
                    {/* Liens spécifiques au rôle */}
                    {roleBasedLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href} className="cursor-pointer flex items-center gap-2 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10">
                          {link.icon}
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator className="bg-cyan-500/30" />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center gap-2 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10">
                        <User className="h-4 w-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer flex items-center gap-2 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10">
                        <Settings className="h-4 w-4" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-cyan-500/30" />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-rose-400 cursor-pointer flex items-center gap-2 hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Non-authenticated state */
              <div className="flex items-center gap-3">
                <Link href="/courses" className="hidden sm:block">
                  <Button variant="ghost" className="text-slate-300 hover:text-cyan-400">
                    Explorer les cours
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">
                    Commencer
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-cyan-500/10 transition"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-cyan-400" /> : <Menu className="h-5 w-5 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-cyan-500/30 space-y-2"
            >
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 gap-3",
                      isActive(link.href) && "text-cyan-400 bg-cyan-500/20"
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </Button>
                </Link>
              ))}
              
              {/* Role-based links on mobile */}
              <div className="pt-2 border-t border-cyan-500/30">
                <p className="text-xs text-cyan-400/70 px-3 py-2">ESPACE {getRoleLabel(currentUser?.role).toUpperCase()}</p>
                {roleBasedLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 gap-3 pl-6"
                    >
                      {link.icon}
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}