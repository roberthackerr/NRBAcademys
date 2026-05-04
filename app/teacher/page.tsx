// app/teacher/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, Users, FileText, TrendingUp, Award, Clock, 
  Calendar, CheckCircle, AlertCircle, Star, Eye, MessageSquare,
  ChevronRight, Sparkles, Crown, Trophy, BarChart3, Activity,
  Target, Zap, Network, Radio, GraduationCap, DollarSign,
  Plus, Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalAssignments: number;
  pendingSubmissions: number;
  averageRating: number;
  totalRevenue: number;
}

interface RecentActivity {
  id: string;
  title: string;
  type: 'submission' | 'enrollment' | 'assignment' | 'course';
  time: string;
  student?: string;
  status: 'pending' | 'completed' | 'new';
}

interface TopCourse {
  id: string;
  title: string;
  studentsCount: number;
  completionRate: number;
  rating: number;
  revenue: number;
}

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    pendingSubmissions: 0,
    averageRating: 0,
    totalRevenue: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch courses data
      const coursesRes = await fetch('/api/teacher/courses');
      const coursesData = await coursesRes.json();
      const courses = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
      
      // Fetch assignments data
      const assignmentsRes = await fetch('/api/teacher/assignments');
      const assignmentsData = await assignmentsRes.json();
      const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.assignments || [];
      
      // Fetch submissions data
      const submissionsRes = await fetch('/api/teacher/submissions');
      const submissionsData = await submissionsRes.json();
      const submissions = Array.isArray(submissionsData) ? submissionsData : submissionsData.submissions || [];
      
      // Calculer les statistiques réelles
      const totalCourses = courses.length;
      const totalStudents = courses.reduce((sum: number, course: any) => sum + (course.studentsCount || 0), 0);
      const totalAssignments = assignments.length;
      const pendingSubmissions = submissions.filter((s: any) => s.status === 'pending' || !s.grade).length;
      
      // Calculer la note moyenne des soumissions notées
      const gradedSubmissions = submissions.filter((s: any) => s.grade !== null && s.grade !== undefined);
      const averageRating = gradedSubmissions.length > 0 
        ? Math.round((gradedSubmissions.reduce((sum: number, s: any) => sum + (s.grade || 0), 0) / gradedSubmissions.length) * 10) / 10
        : 0;
      
      // Calculer les revenus (exemple: 20€ par étudiant inscrit)
      const totalRevenue = totalStudents * 20;
      
      setStats({
        totalCourses,
        totalStudents,
        totalAssignments,
        pendingSubmissions,
        averageRating,
        totalRevenue
      });
      
      // Top courses (triées par nombre d'étudiants)
      const topCoursesData = courses
        .sort((a: any, b: any) => (b.studentsCount || 0) - (a.studentsCount || 0))
        .slice(0, 3)
        .map((course: any, index: number) => ({
          id: course._id || course.id,
          title: course.title,
          studentsCount: course.studentsCount || 0,
          completionRate: Math.floor(Math.random() * 30) + 60, // À remplacer par des données réelles
          rating: (course.rating || 4.5).toFixed(1),
          revenue: (course.studentsCount || 0) * 20
        }));
      
      setTopCourses(topCoursesData);
      
      // Activities récentes (submissions en attente)
      const pendingSubs = submissions
        .filter((s: any) => s.status === 'pending' || !s.grade)
        .slice(0, 5)
        .map((sub: any) => ({
          id: sub._id,
          title: sub.assignment?.title || 'Devoir',
          type: 'submission' as const,
          time: new Date(sub.submittedAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          student: `${sub.student?.firstName || ''} ${sub.student?.lastName || ''}`.trim(),
          status: 'pending' as const
        }));
      
      setRecentActivities(pendingSubs);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Cours créés', value: stats.totalCourses, icon: BookOpen, color: 'from-purple-500 to-pink-500', suffix: '' },
    { title: 'Étudiants', value: stats.totalStudents, icon: Users, color: 'from-blue-500 to-cyan-500', suffix: '', format: true },
    { title: 'Devoirs', value: stats.totalAssignments, icon: FileText, color: 'from-emerald-500 to-teal-500', suffix: '' },
    { title: 'À noter', value: stats.pendingSubmissions, icon: Clock, color: 'from-amber-500 to-orange-500', suffix: '' },
    { title: 'Note moyenne', value: stats.averageRating, icon: Star, color: 'from-yellow-500 to-amber-500', suffix: '/20', isGrade: true },
    { title: 'Revenus', value: stats.totalRevenue, icon: DollarSign, color: 'from-green-500 to-emerald-500', suffix: '€', isCurrency: true },
  ];

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'submission': return <FileText className="w-4 h-4 text-amber-400" />;
      case 'enrollment': return <Users className="w-4 h-4 text-emerald-400" />;
      case 'assignment': return <FileText className="w-4 h-4 text-cyan-400" />;
      default: return <Sparkles className="w-4 h-4 text-violet-400" />;
    }
  };

  const getActivityBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">En attente</span>;
      case 'new': return <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">Nouveau</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">Terminé</span>;
    }
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
            Bienvenue dans votre espace enseignant, {session?.user?.name?.split(' ')[0]}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
          <Radio className="h-3 w-3" />
          <span>CONNEXION ACTIVE</span>
        </div>
      </div>

      {/* Stats Grid */}
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
                  {stat.isCurrency && '€ '}
                  {stat.format ? stats.totalStudents.toLocaleString() : stat.value}
                  {stat.suffix}
                </p>
                {stat.isGrade && stat.value > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(stat.value / 4) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                    ))}
                  </div>
                )}
              </div>
              <stat.icon className="w-8 h-8 text-white/50" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600/20 via-violet-600/20 to-purple-600/20 border border-cyan-500/30 p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">
                {stats.totalStudents > 100 ? 'Top Enseignant' : 'Enseignant certifié'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {stats.pendingSubmissions > 0 
                ? `${stats.pendingSubmissions} soumission(s) en attente de correction`
                : 'Félicitations ! Tous les devoirs sont corrigés'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Vous avez formé {stats.totalStudents} étudiant{stats.totalStudents > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link
            href="/teacher/courses/create"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            + Créer un nouveau cours
          </Link>
        </div>
      </motion.div>

      {/* Top Courses & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white/5 rounded-2xl border border-cyan-500/30 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              {topCourses.length > 0 ? 'Meilleurs cours' : 'Vos cours'}
            </h3>
            <Link href="/teacher/courses" className="text-cyan-400 text-sm hover:text-cyan-300 transition flex items-center gap-1">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {topCourses.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Aucun cours pour le moment</p>
              <Link href="/teacher/courses/create" className="text-cyan-400 text-sm hover:underline mt-2 inline-block">
                Créer votre premier cours
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {topCourses.map((course, idx) => (
                <div key={course.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{course.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.studentsCount} étudiant{course.studentsCount > 1 ? 's' : ''}
                        </span>
                        {course.completionRate > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {course.completionRate}% complété
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          {course.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold">{course.revenue}€</p>
                    <p className="text-xs text-slate-500">revenus</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Submissions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-4"
        >
          <div className="bg-white/5 rounded-2xl border border-cyan-500/30 p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-cyan-400" />
              Progression globale
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Création de cours</span>
                  <span className="text-white">{Math.min(100, Math.round((stats.totalCourses / 20) * 100))}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-violet-600 h-2 rounded-full" style={{ width: `${Math.min(100, Math.round((stats.totalCourses / 20) * 100))}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Soumissions corrigées</span>
                  <span className="text-white">
                    {stats.totalAssignments > 0 
                      ? Math.round(((stats.totalAssignments - stats.pendingSubmissions) / stats.totalAssignments) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: `${stats.totalAssignments > 0 ? ((stats.totalAssignments - stats.pendingSubmissions) / stats.totalAssignments) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {stats.pendingSubmissions > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-400 text-sm font-medium">En attente de correction</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingSubmissions}</p>
                </div>
              </div>
              <Link
                href="/teacher/submissions"
                className="mt-4 text-amber-400 text-sm hover:text-amber-300 transition flex items-center gap-1"
              >
                Corriger maintenant <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 rounded-2xl border border-cyan-500/30 p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Soumissions récentes
          </h3>
          {recentActivities.length > 0 && (
            <Link href="/teacher/submissions" className="text-cyan-400 text-sm hover:text-cyan-300 transition flex items-center gap-1">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune soumission en attente</p>
            <p className="text-xs mt-1">Tous les devoirs sont corrigés !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {activity.student && (
                        <span className="text-xs text-slate-400">{activity.student}</span>
                      )}
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
                {getActivityBadge(activity.status)}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link
          href="/teacher/courses"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Nouveau cours</span>
        </Link>
        <Link
          href="/teacher/assignments"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Nouveau devoir</span>
        </Link>
        <Link
          href="/teacher/submissions"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition"
        >
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            Corriger ({stats.pendingSubmissions})
          </span>
        </Link>
        <Link
          href="/teacher/courses"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
        >
          <GraduationCap className="w-4 h-4" />
          <span className="text-sm font-medium">Mes cours</span>
        </Link>
      </motion.div>
    </div>
  );
}