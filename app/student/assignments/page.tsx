// app/student/assignments/page.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Upload, Download, Clock, CheckCircle, AlertCircle, FileText, 
  Calendar, Send, Star, Award, TrendingUp, BookOpen, User,
  ExternalLink, Eye, MessageSquare, ChevronRight, Filter, Search,
  Trophy, Medal, Sparkles, X, Loader2, Network, Radio
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  deadline: string;
  maxPoints: number;
  courseId: string;
  course?: {
    _id: string;
    title: string;
  };
  submitted: boolean;
  submission?: {
    _id: string;
    content: string;
    fileUrl: string;
    grade: number;
    feedback: string;
    submittedAt: string;
  };
  createdAt: string;
}

interface SubmissionData {
  content: string;
  file: File | null;
}

interface Stats {
  total: number;
  submitted: number;
  graded: number;
  pending: number;
  average: number;
}

export default function StudentAssignments() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionData, setSubmissionData] = useState<SubmissionData>({ content: '', file: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState<Stats>({ total: 0, submitted: 0, graded: 0, pending: 0, average: 0 });

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/assignments');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setAssignments(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Erreur lors du chargement des devoirs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm, statusFilter]);

  const calculateStats = (data: Assignment[]) => {
    const total = data.length;
    const submitted = data.filter(a => a.submitted === true).length;
    const graded = data.filter(a => a.submission && a.submission.grade !== null).length;
    const pending = submitted - graded;
    const gradedSubmissions = data.filter(a => a.submission && a.submission.grade !== null);
    const average = graded > 0 
      ? gradedSubmissions.reduce((sum, a) => sum + (a.submission?.grade || 0), 0) / graded 
      : 0;
    
    setStats({ total, submitted, graded, pending, average: Math.round(average * 10) / 10 });
  };

  const filterAssignments = () => {
    let filtered = [...assignments];
    
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter === 'submitted') {
      filtered = filtered.filter(a => a.submitted === true);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(a => !a.submitted);
    } else if (statusFilter === 'graded') {
      filtered = filtered.filter(a => a.submission && a.submission.grade !== null);
    }
    
    setFilteredAssignments(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    
    setSubmitting(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('content', submissionData.content);
      if (submissionData.file) {
        formData.append('file', submissionData.file);
      }
      
      const res = await fetch(`/api/student/assignments/${selectedAssignment._id}/submit`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error('Erreur lors de la soumission');
      
      toast.success('Devoir soumis avec succès !');
      setShowModal(false);
      setSubmissionData({ content: '', file: null });
      fetchAssignments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (assignment: Assignment) => {
    if (assignment.submission && assignment.submission.grade !== null) {
      return <Award className="w-5 h-5 text-emerald-400" />;
    }
    if (assignment.submitted) {
      return <Clock className="w-5 h-5 text-amber-400" />;
    }
    return <AlertCircle className="w-5 h-5 text-rose-400" />;
  };

  const getStatusText = (assignment: Assignment) => {
    if (assignment.submission && assignment.submission.grade !== null) {
      return `Noté: ${assignment.submission.grade}/${assignment.maxPoints || 20}`;
    }
    if (assignment.submitted) {
      return 'En attente de correction';
    }
    return 'Non soumis';
  };

  const getStatusColor = (assignment: Assignment) => {
    if (assignment.submission && assignment.submission.grade !== null) return 'text-emerald-400';
    if (assignment.submitted) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-purple-400';
    if (grade >= 14) return 'text-blue-400';
    if (grade >= 12) return 'text-cyan-400';
    if (grade >= 10) return 'text-amber-400';
    return 'text-rose-400';
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Mes devoirs
            </h1>
            <p className="text-slate-400 text-sm mt-1">Consultez et soumettez vos travaux</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
            <Radio className="h-3 w-3" />
            <span>CONNEXION ACTIVE</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-3 text-center border border-purple-500/30 backdrop-blur-sm">
            <FileText className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-purple-400 text-xs">Total devoirs</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-3 text-center border border-blue-500/30 backdrop-blur-sm">
            <Send className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.submitted}</p>
            <p className="text-blue-400 text-xs">Soumis</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-3 text-center border border-amber-500/30 backdrop-blur-sm">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.pending}</p>
            <p className="text-amber-400 text-xs">En attente</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-3 text-center border border-emerald-500/30 backdrop-blur-sm">
            <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.graded}</p>
            <p className="text-emerald-400 text-xs">Notés</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-3 text-center border border-amber-500/30 backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.average}/20</p>
            <p className="text-amber-400 text-xs">Moyenne</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-cyan-500/30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="Rechercher un devoir..."
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
              <option value="all">Tous les devoirs</option>
              <option value="submitted">Soumis</option>
              <option value="pending">Non soumis</option>
              <option value="graded">Notés</option>
            </select>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-16 text-center border border-cyan-500/30">
            <FileText className="w-20 h-20 text-cyan-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">Aucun devoir</h3>
            <p className="text-cyan-400">Aucun devoir ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment, idx) => (
              <motion.div
                key={assignment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
              >
                <div className="p-5">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    {/* Left side - Assignment Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-lg font-bold text-white">{assignment.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
                          {assignment.course?.title}
                        </span>
                        {isDeadlinePassed(assignment.deadline) && !assignment.submitted && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-400">
                            Date dépassée
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{assignment.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs mb-3">
                        <div className="flex items-center gap-1 text-cyan-400">
                          <Calendar className="w-3 h-3" />
                          <span>À rendre: {formatDate(assignment.deadline)}</span>
                        </div>
                        {assignment.maxPoints && (
                          <div className="flex items-center gap-1 text-violet-400">
                            <Star className="w-3 h-3" />
                            <span>Note max: {assignment.maxPoints} pts</span>
                          </div>
                        )}
                      </div>
                      
                      {assignment.instructions && (
                        <div className="bg-cyan-500/5 rounded-xl p-3 mb-3 border border-cyan-500/20">
                          <p className="text-slate-300 text-sm">{assignment.instructions}</p>
                        </div>
                      )}
                      
                      {/* Submission Status */}
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(assignment)}
                        <span className={`text-sm ${getStatusColor(assignment)}`}>
                          {getStatusText(assignment)}
                        </span>
                      </div>
                      
                      {/* Grade Display */}
                      {assignment.submission && assignment.submission.grade !== null && (
                        <div className="mt-2 p-2 bg-emerald-500/10 rounded-xl flex items-center justify-between border border-emerald-500/30">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="text-white text-sm font-medium">Note obtenue</span>
                          </div>
                          <span className={`text-2xl font-bold ${getGradeColor(assignment.submission.grade)}`}>
                            {assignment.submission.grade}
                            <span className="text-sm text-slate-400">/{assignment.maxPoints || 20}</span>
                          </span>
                        </div>
                      )}
                      
                      {/* Feedback */}
                      {assignment.submission && assignment.submission.feedback && (
                        <div className="mt-2 p-2 bg-blue-500/10 rounded-xl border border-blue-500/30">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            <p className="text-blue-400 text-xs font-medium">Feedback</p>
                          </div>
                          <p className="text-white text-sm">{assignment.submission.feedback}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Right side - Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {!assignment.submitted && !isDeadlinePassed(assignment.deadline) && (
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowModal(true);
                          }}
                          className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                        >
                          <Send className="w-4 h-4" /> Soumettre
                        </button>
                      )}
                      
                      {assignment.submitted && (
                        <div className="text-center">
                          <p className="text-cyan-400 text-xs">Soumis le</p>
                          <p className="text-white text-sm font-medium">
                            {assignment.submission?.submittedAt 
                              ? formatDate(assignment.submission.submittedAt)
                              : 'Date inconnue'}
                          </p>
                        </div>
                      )}
                      
                      {assignment.submission?.fileUrl && (
                        <a
                          href={assignment.submission.fileUrl}
                          download
                          className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition"
                        >
                          <Download className="w-4 h-4" /> Ma soumission
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de soumission - Style Futuriste */}
      <AnimatePresence>
        {showModal && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
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
                    <h2 className="text-xl font-bold text-white">Soumettre un devoir</h2>
                    <p className="text-cyan-200 text-sm mt-1">{selectedAssignment.title}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Deadline reminder */}
                <div className="mb-4 p-3 bg-amber-500/10 rounded-xl flex items-center gap-2 border border-amber-500/30">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-sm">
                    À rendre avant le {formatDate(selectedAssignment.deadline)}
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-2">Votre réponse</label>
                    <textarea
                      rows={6}
                      value={submissionData.content}
                      onChange={(e) => setSubmissionData({...submissionData, content: e.target.value})}
                      className="w-full px-4 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-cyan-400/30"
                      placeholder="Écrivez votre réponse ici..."
                      required={!submissionData.file}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-2">Fichier joint</label>
                    <div 
                      className="border-2 border-dashed border-cyan-500/30 rounded-xl p-6 text-center hover:border-cyan-500/60 transition cursor-pointer"
                      onClick={() => document.getElementById('fileInput')?.click()}
                    >
                      <input
                        id="fileInput"
                        type="file"
                        onChange={(e) => setSubmissionData({...submissionData, file: e.target.files?.[0] || null})}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png,.mp4,.mp3"
                      />
                      <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                      <p className="text-cyan-400 text-sm">Cliquez ou glissez un fichier</p>
                      <p className="text-slate-400 text-xs mt-1">
                        PDF, DOC, TXT, ZIP, JPG, PNG, MP4, MP3 (max 50MB)
                      </p>
                    </div>
                    
                    {submissionData.file && (
                      <div className="mt-3 p-3 bg-cyan-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            <span className="text-white text-sm">{submissionData.file.name}</span>
                          </div>
                          <span className="text-cyan-400 text-xs">
                            {(submissionData.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-500 to-violet-600 h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-cyan-400 text-xs mt-1 text-center">Upload: {uploadProgress}%</p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Soumettre
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
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