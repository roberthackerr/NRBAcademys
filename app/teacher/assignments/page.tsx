// app/teacher/assignments/page.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Plus, Trash2, Edit, Eye, Download, Clock, BookOpen, Users, 
  CheckCircle, XCircle, Calendar, Star, Loader2, 
  FileText, Send, AlertCircle, ChevronRight, X,
  GraduationCap, Target, Trophy, Zap, Sparkles, Crown
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
  teacherId: string;
  submissionsCount?: number;
  course?: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  _id: string;
  content: string;
  fileUrl: string;
  grade: number;
  feedback: string;
  status: 'pending' | 'graded' | 'late';
  assignmentId: string;
  studentId: string;
  student?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  submittedAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
}

export default function TeacherAssignments() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    deadline: '', 
    courseId: '',
    maxPoints: 100,
    instructions: ''
  });

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/assignments');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Erreur lors du chargement des devoirs');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher/courses');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Erreur lors du chargement des cours');
    }
  }, []);

  const fetchSubmissions = useCallback(async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/teacher/assignments/${assignmentId}/submissions`);
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Erreur lors du chargement des soumissions');
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, [fetchAssignments, fetchCourses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Erreur lors de la création');
      
      toast.success('Devoir créé avec succès');
      setShowModal(false);
      fetchAssignments();
      setFormData({ title: '', description: '', deadline: '', courseId: '', maxPoints: 100, instructions: '' });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Erreur lors de la création du devoir');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce devoir ?')) return;
    
    try {
      const res = await fetch(`/api/teacher/assignments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      
      toast.success('Devoir supprimé avec succès');
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleGrade = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const res = await fetch(`/api/teacher/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, feedback })
      });
      
      if (!res.ok) throw new Error('Erreur lors de la notation');
      
      toast.success('Soumission notée avec succès');
      if (selectedAssignment) {
        await fetchSubmissions(selectedAssignment._id);
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Erreur lors de la notation');
    }
  };

  const viewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    await fetchSubmissions(assignment._id);
    setShowSubmissionsModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'graded': 
        return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Noté</span>;
      case 'pending': 
        return <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>;
      case 'late': 
        return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> En retard</span>;
      default: 
        return <span className="bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
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

  if (loading && assignments.length === 0) {
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
            Gestion des devoirs
          </h1>
          <p className="text-slate-400 text-sm mt-1">Créez et gérez les devoirs de vos cours</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Nouveau devoir
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-5 border border-purple-500/30">
          <BookOpen className="w-6 h-6 text-purple-400 mb-2" />
          <p className="text-3xl font-bold text-white">{assignments.length}</p>
          <p className="text-purple-400 text-sm">Total devoirs</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-5 border border-blue-500/30">
          <Users className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-3xl font-bold text-white">
            {assignments.reduce((sum, a) => sum + (a.submissionsCount || 0), 0)}
          </p>
          <p className="text-blue-400 text-sm">Soumissions reçues</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-5 border border-amber-500/30">
          <Clock className="w-6 h-6 text-amber-400 mb-2" />
          <p className="text-3xl font-bold text-white">
            {assignments.filter(a => !isDeadlinePassed(a.deadline)).length}
          </p>
          <p className="text-amber-400 text-sm">Devoirs en cours</p>
        </div>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="bg-white/5 rounded-2xl p-16 text-center border border-cyan-500/30">
          <FileText className="w-20 h-20 text-cyan-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-white mb-2">Aucun devoir</h3>
          <p className="text-cyan-400">Créez votre premier devoir pour vos étudiants</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="text-lg font-bold text-white">{assignment.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
                        {assignment.course?.title}
                      </span>
                      {isDeadlinePassed(assignment.deadline) ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                          Date dépassée
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{assignment.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1 text-cyan-400">
                        <Calendar className="w-3 h-3" />
                        <span>Deadline: {formatDate(assignment.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-violet-400">
                        <Users className="w-3 h-3" />
                        <span>{assignment.submissionsCount || 0} soumissions</span>
                      </div>
                      {assignment.maxPoints && (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Star className="w-3 h-3" />
                          <span>Note max: {assignment.maxPoints} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewSubmissions(assignment)}
                      className="p-2 hover:bg-white/10 rounded-xl transition group"
                      title="Voir les soumissions"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(assignment._id)}
                      className="p-2 hover:bg-white/10 rounded-xl transition group"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Création Devoir - Style Futuriste */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-violet-600 p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Créer un devoir</h2>
                  <p className="text-cyan-200 text-sm">Définissez les détails de votre devoir</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Titre du devoir *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Cours *</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="">Sélectionnez un cours</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Décrivez le devoir, les attentes..."
                  />
                </div>
                
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Instructions</label>
                  <textarea
                    rows={2}
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Instructions détaillées pour les étudiants"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-1">Date limite *</label>
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-1">Points maximum</label>
                    <input
                      type="number"
                      value={formData.maxPoints}
                      onChange={(e) => setFormData({...formData, maxPoints: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                      placeholder="100"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Créer le devoir'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/10 text-white py-2.5 rounded-xl font-semibold hover:bg-white/20 transition">Annuler</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Soumissions - Style Futuriste */}
      <AnimatePresence>
        {showSubmissionsModal && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowSubmissionsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-violet-600 p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Soumissions</h2>
                  <p className="text-cyan-200 text-sm">{selectedAssignment.title}</p>
                </div>
                <button onClick={() => setShowSubmissionsModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">✕</button>
              </div>
              
              <div className="p-6">
                {submissions.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
                    <p className="text-cyan-400">Aucune soumission pour ce devoir</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div key={submission._id} className="bg-white/5 rounded-xl p-5 border border-cyan-500/30">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {submission.student?.firstName?.charAt(0)}{submission.student?.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">
                                  {submission.student?.firstName} {submission.student?.lastName}
                                </h4>
                                <p className="text-cyan-400 text-xs">
                                  Soumis le {formatDate(submission.submittedAt)}
                                </p>
                              </div>
                            </div>
                            
                            {submission.content && (
                              <div className="bg-black/30 rounded-xl p-4 mb-3">
                                <p className="text-slate-300 text-sm">{submission.content}</p>
                              </div>
                            )}
                            
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
                            
                            {submission.grade !== null && (
                              <div className="mt-3 pt-3 border-t border-cyan-500/30">
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-sm">Note:</span>
                                  <span className="text-2xl font-bold text-yellow-400">{submission.grade}</span>
                                  <span className="text-slate-400">/{selectedAssignment.maxPoints || 100}</span>
                                </div>
                                {submission.feedback && (
                                  <p className="text-cyan-400 text-sm mt-1">Feedback: {submission.feedback}</p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(submission.status)}
                            {!submission.grade && (
                              <button
                                onClick={() => {
                                  const grade = prompt(`Note sur ${selectedAssignment.maxPoints || 100}:`, '0');
                                  if (grade !== null) {
                                    const feedback = prompt('Feedback (optionnel):', '');
                                    handleGrade(submission._id, parseInt(grade), feedback || '');
                                  }
                                }}
                                className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-4 py-1.5 rounded-lg text-sm hover:shadow-lg transition"
                              >
                                Noter
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}