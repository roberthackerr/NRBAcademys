// app/teacher/submissions/page.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FileText, User, Calendar, Download, CheckCircle, XCircle, 
  Clock, Award, TrendingUp, Users, BookOpen, Search, Filter,
  Star, Eye, MessageSquare, Send, AlertCircle, ChevronRight,
  Trophy, Medal, Sparkles, Crown, Gem, X, Edit, Loader2, Network, Radio
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Submission {
  _id: string;
  content: string;
  fileUrl: string;
  grade: number;
  feedback: string;
  status: 'pending' | 'graded' | 'late';
  assignmentId: string;
  studentId: string;
  teacherId: string;
  assignment?: {
    _id: string;
    title: string;
    description: string;
  };
  student?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  maxPoints: number;
}

interface Stats {
  total: number;
  graded: number;
  pending: number;
  average: number;
}

export default function TeacherSubmissions() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, graded: 0, pending: 0, average: 0 });

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/submissions');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setSubmissions(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Erreur lors du chargement des soumissions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher/assignments');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Erreur lors du chargement des devoirs');
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
    fetchAssignments();
  }, [fetchSubmissions, fetchAssignments]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter, assignmentFilter]);

  const calculateStats = (data: Submission[]) => {
    const total = data.length;
    const graded = data.filter(s => s.status === 'graded' || s.grade !== null).length;
    const pending = total - graded;
    const average = graded > 0 
      ? data.filter(s => s.grade).reduce((sum, s) => sum + (s.grade || 0), 0) / graded 
      : 0;
    
    setStats({ total, graded, pending, average: Math.round(average * 10) / 10 });
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.assignment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => 
        statusFilter === 'graded' ? (s.status === 'graded' || s.grade !== null) : s.status === 'pending'
      );
    }
    
    if (assignmentFilter !== 'all') {
      filtered = filtered.filter(s => s.assignmentId === assignmentFilter);
    }
    
    setFilteredSubmissions(filtered);
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    
    try {
      const res = await fetch(`/api/teacher/submissions/${selectedSubmission._id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: parseInt(gradeData.grade),
          feedback: gradeData.feedback
        })
      });
      
      if (!res.ok) throw new Error('Erreur lors de la notation');
      
      toast.success('Soumission notée avec succès');
      setShowGradeModal(false);
      fetchSubmissions();
      setGradeData({ grade: '', feedback: '' });
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Erreur lors de la notation');
    }
  };

  const getStatusBadge = (submission: Submission) => {
    if (submission.grade !== null && submission.grade !== undefined) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
          <CheckCircle className="w-3 h-3" /> Noté: {submission.grade}/20
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">
        <Clock className="w-3 h-3" /> En attente
      </div>
    );
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-purple-400';
    if (grade >= 14) return 'text-blue-400';
    if (grade >= 12) return 'text-cyan-400';
    if (grade >= 10) return 'text-amber-400';
    return 'text-rose-400';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      
      {/* Floating Nodes */}
      <div className="fixed top-40 right-20 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-ping pointer-events-none"></div>
      <div className="fixed bottom-40 left-20 w-2 h-2 bg-violet-400 rounded-full shadow-lg shadow-violet-400/50 animate-pulse delay-700 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Gestion des soumissions
            </h1>
            <p className="text-slate-400 text-sm mt-1">Consultez et notez les travaux des étudiants</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
            <Radio className="h-3 w-3" />
            <span>CONNEXION ACTIVE</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-5 border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm">Total soumissions</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-5 border border-emerald-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-sm">Notées</p>
                <p className="text-3xl font-bold text-white">{stats.graded}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-5 border border-amber-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm">En attente</p>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-5 border border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm">Moyenne</p>
                <p className="text-3xl font-bold text-white">{stats.average}/20</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-cyan-500/30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="Rechercher par étudiant, devoir..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="graded">Notés</option>
            </select>
            
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="px-4 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Tous les devoirs</option>
              {assignments.map(assignment => (
                <option key={assignment._id} value={assignment._id}>{assignment.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-16 text-center border border-cyan-500/30">
            <FileText className="w-20 h-20 text-cyan-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">Aucune soumission</h3>
            <p className="text-cyan-400">Aucune soumission ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission, idx) => (
              <motion.div
                key={submission._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
              >
                <div className="p-5">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    {/* Left side - Student & Assignment Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {submission.student?.firstName?.charAt(0)}{submission.student?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {submission.student?.firstName} {submission.student?.lastName}
                          </h3>
                          <div className="flex items-center gap-3 text-cyan-400 text-xs">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> {submission.assignment?.title}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Soumis le {formatDate(submission.submittedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content Preview */}
                      {submission.content && (
                        <div className="bg-black/30 rounded-xl p-3 mb-3">
                          <p className="text-slate-300 text-sm whitespace-pre-wrap line-clamp-3">
                            {submission.content}
                          </p>
                        </div>
                      )}
                      
                      {/* File Attachment */}
                      {submission.fileUrl && (
                        <a
                          href={submission.fileUrl}
                          download
                          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-3 transition"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger le fichier joint
                        </a>
                      )}
                      
                      {/* Feedback if exists */}
                      {submission.feedback && (
                        <div className="mt-3 pt-3 border-t border-cyan-500/30">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-cyan-400 mt-0.5" />
                            <div>
                              <p className="text-cyan-400 text-xs font-medium">Feedback</p>
                              <p className="text-white text-sm">{submission.feedback}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right side - Grade & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {getStatusBadge(submission)}
                      
                      {submission.grade !== null && submission.grade !== undefined && (
                        <div className="text-center">
                          <p className="text-cyan-400 text-xs">Note obtenue</p>
                          <p className={`text-3xl font-bold ${getGradeColor(submission.grade)}`}>
                            {submission.grade}
                            <span className="text-sm text-slate-400">/20</span>
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setGradeData({
                            grade: submission.grade?.toString() || '',
                            feedback: submission.feedback || ''
                          });
                          setShowGradeModal(true);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                          submission.grade !== null && submission.grade !== undefined
                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            : 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                        }`}
                      >
                        {submission.grade !== null && submission.grade !== undefined ? (
                          <>
                            <Edit className="w-4 h-4" /> Modifier la note
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4" /> Noter
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de notation - Style Futuriste */}
      <AnimatePresence>
        {showGradeModal && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowGradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl max-w-lg w-full shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-cyan-600 to-violet-600 p-5 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Noter la soumission</h2>
                    <p className="text-cyan-200 text-sm mt-1">
                      {selectedSubmission.assignment?.title}
                    </p>
                  </div>
                  <button onClick={() => setShowGradeModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Student Info */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl border border-cyan-500/30">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {selectedSubmission.student?.firstName?.charAt(0)}
                      {selectedSubmission.student?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {selectedSubmission.student?.firstName} {selectedSubmission.student?.lastName}
                    </p>
                    <p className="text-cyan-400 text-xs">
                      Soumis le {formatDate(selectedSubmission.submittedAt)}
                    </p>
                  </div>
                </div>

                {/* Content Preview */}
                {selectedSubmission.content && (
                  <div className="mb-6">
                    <label className="block text-cyan-400 text-sm font-medium mb-2">Contenu soumis</label>
                    <div className="bg-black/30 rounded-xl p-3 max-h-40 overflow-y-auto border border-cyan-500/30">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">
                        {selectedSubmission.content}
                      </p>
                    </div>
                  </div>
                )}

                {/* File Link */}
                {selectedSubmission.fileUrl && (
                  <div className="mb-6">
                    <label className="block text-cyan-400 text-sm font-medium mb-2">Fichier joint</label>
                    <a
                      href={selectedSubmission.fileUrl}
                      download
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger le fichier
                    </a>
                  </div>
                )}

                {/* Grade Form */}
                <form onSubmit={handleGrade} className="space-y-4">
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-2">
                      Note /20 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={gradeData.grade}
                      onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                      className="w-full px-4 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                    <p className="text-cyan-400 text-xs mt-1">Note entre 0 et 20</p>
                  </div>
                  
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-2">Feedback</label>
                    <textarea
                      rows={4}
                      value={gradeData.feedback}
                      onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                      className="w-full px-4 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Commentez le travail de l'étudiant..."
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Enregistrer la note
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGradeModal(false)}
                      className="flex-1 bg-white/10 text-white py-2.5 rounded-xl font-semibold hover:bg-white/20 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}