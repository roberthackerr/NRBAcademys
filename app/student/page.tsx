// app/student/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, Clock, Award, TrendingUp, Star, Calendar,
  ChevronRight, PlayCircle, CheckCircle, AlertCircle,
  Target, Zap, Network, Radio, GraduationCap, Trophy,
  Sparkles, Crown, Users, MessageSquare, Loader2,FileText
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Stats {
  enrolledCourses: number;
  completedCourses: number;
  totalHours: number;
  certificates: number;
  averageScore: number;
  currentStreak: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  progress: number;
  lastAccessed?: string;
  thumbnail?: string;
}

interface UpcomingAssignment {
  _id: string;
  title: string;
  deadline: string;
  courseTitle: string;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificates: 0,
    averageScore: 0,
    currentStreak: 0
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<UpcomingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch enrolled courses
      const enrolledRes = await fetch('/api/student/enrolled-courses');
      const enrolledData = await enrolledRes.json();
      const enrolledCourses = Array.isArray(enrolledData) ? enrolledData : enrolledData.courses || [];
      
      // Fetch assignments
      const assignmentsRes = await fetch('/api/student/assignments');
      const assignmentsData = await assignmentsRes.json();
      const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.assignments || [];
      
      // Calculer les statistiques
      const completedCourses = enrolledCourses.filter((c: any) => c.progress === 100).length;
      const totalHours = enrolledCourses.reduce((sum: number, c: any) => sum + (c.totalHours || 0), 0);
      const averageScore = enrolledCourses.length > 0 
        ? Math.round(enrolledCourses.reduce((sum: number, c: any) => sum + (c.averageScore || 0), 0) / enrolledCourses.length)
        : 0;
      
      // Progression globale
      const totalProgress = enrolledCourses.reduce((sum: number, c: any) => sum + (c.progress || 0), 0);
      const globalProgress = enrolledCourses.length > 0 ? Math.round(totalProgress / enrolledCourses.length) : 0;
      
      setStats({
        enrolledCourses: enrolledCourses.length,
        completedCourses,
        totalHours,
        certificates: completedCourses,
        averageScore,
        currentStreak: 5
      });
      
      setProgress(globalProgress);
      
      // Derniers cours consultés
      const recent = enrolledCourses
        .sort((a: any, b: any) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 3);
      setRecentCourses(recent);
      
      // Devoirs à venir
      const upcoming = assignments
        .filter((a: any) => !a.submitted && new Date(a.deadline) > new Date())
        .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5)
        .map((a: any) => ({
          _id: a._id,
          title: a.title,
          deadline: a.deadline,
          courseTitle: a.course?.title || 'Cours'
        }));
      setUpcomingAssignments(upcoming);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Cours inscrits', value: stats.enrolledCourses, icon: BookOpen, color: 'from-purple-500 to-pink-500', suffix: '' },
    { title: 'Cours terminés', value: stats.completedCourses, icon: Award, color: 'from-emerald-500 to-teal-500', suffix: '' },
    { title: "Heures d'étude", value: stats.totalHours, icon: Clock, color: 'from-blue-500 to-cyan-500', suffix: 'h' },
    { title: 'Certificats', value: stats.certificates, icon: Trophy, color: 'from-amber-500 to-orange-500', suffix: '' },
    { title: 'Moyenne', value: stats.averageScore, icon: Star, color: 'from-yellow-500 to-amber-500', suffix: '/20' },
    { title: 'Série 🔥', value: stats.currentStreak, icon: Zap, color: 'from-rose-500 to-pink-500', suffix: ' jours' },
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long'
    });
  };

  const getDaysLeft = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Dépassé';
    if (diff === 0) return 'Aujourd\'hui';
    return `${diff} jours`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Bienvenue dans votre espace étudiant, {session?.user?.name?.split(' ')[0]}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
          <Radio className="h-3 w-3" />
          <span>CONNEXION ACTIVE</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-gradient-to-r ${stat.color} rounded-2xl p-4 border border-white/10 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stat.value}{stat.suffix}
                </p>
              </div>
              <stat.icon className="w-8 h-8 text-white/50" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Welcome & Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600/20 via-violet-600/20 to-purple-600/20 border border-cyan-500/30 p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">PROGRESSION GLOBALE</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white">Votre progression</span>
                <span className="text-cyan-400">{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-500 to-violet-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-slate-400 text-sm mt-3">
                {progress === 100 
                  ? '🎉 Félicitations ! Vous avez terminé tous vos cours !'
                  : `Continuez vos efforts ! ${100 - progress}% restant avant la complétion`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{stats.enrolledCourses}</p>
              <p className="text-slate-400 text-xs">cours suivis</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Courses & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 rounded-2xl border border-cyan-500/30 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-cyan-400" />
              Cours récents
            </h3>
            <Link href="/student/courses" className="text-cyan-400 text-sm hover:text-cyan-300 transition flex items-center gap-1">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentCourses.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun cours pour le moment</p>
              <Link href="/courses" className="text-cyan-400 text-sm hover:underline mt-2 inline-block">
                Explorer les cours
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <Link
                  key={course._id}
                  href={`/student/courses/${course._id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium group-hover:text-cyan-400 transition">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 bg-white/10 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-cyan-500 to-violet-600 h-1.5 rounded-full" style={{ width: `${course.progress}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{course.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white/5 rounded-2xl border border-cyan-500/30 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Devoirs à venir
            </h3>
            <Link href="/student/assignments" className="text-cyan-400 text-sm hover:text-cyan-300 transition flex items-center gap-1">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingAssignments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun devoir en attente</p>
              <p className="text-xs mt-1">Tous les devoirs sont terminés !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => {
                const daysLeft = getDaysLeft(assignment.deadline);
                const isUrgent = daysLeft !== 'Dépassé' && parseInt(daysLeft) < 3;
                return (
                  <Link
                    key={assignment._id}
                    href={`/student/assignments/${assignment._id}`}
                    className="block group"
                  >
                    <div className={`flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition border ${
                      isUrgent ? 'border-amber-500/30 bg-amber-500/5' : 'border-transparent'
                    }`}>
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isUrgent ? 'bg-amber-500/20' : 'bg-white/5'
                        }`}>
                          <FileText className={`w-5 h-5 ${isUrgent ? 'text-amber-400' : 'text-cyan-400'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium group-hover:text-cyan-400 transition">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-slate-400">{assignment.courseTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isUrgent ? 'text-amber-400' : 'text-slate-400'}`}>
                          {formatDate(assignment.deadline)}
                        </p>
                        <p className={`text-xs ${isUrgent ? 'text-amber-400/70' : 'text-slate-500'}`}>
                          {daysLeft}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link
          href="/courses"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Explorer les cours</span>
        </Link>
        <Link
          href="/student/assignments"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Mes devoirs</span>
        </Link>
        <Link
          href="/student/progress"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Ma progression</span>
        </Link>
        <Link
          href="/student/certificates"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition"
        >
          <Award className="w-4 h-4" />
          <span className="text-sm font-medium">Certificats</span>
        </Link>
      </motion.div>
    </div>
  );
}