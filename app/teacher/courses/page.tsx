// app/teacher/courses/page.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Upload, Video, Music, Image, FileText, 
  X, ChevronUp, ChevronDown, Play, Clock, Eye, EyeOff, 
  BookOpen, Users, Save, File, Download, 
  CheckCircle, AlertCircle, Globe, Lock, Sparkles,
  Network, Radio, Zap, Trophy, Star, Target, ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  _id: string;
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  prerequisites: string[];
  objectives: string[];
  isPublished: boolean;
  studentsCount: number;
  contents?: Content[];
  createdAt: string;
  teacherId: string;
}

interface Content {
  _id: string;
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'pdf';
  duration: number;
  content?: string;
  fileUrl?: string;
  fileSize?: number;
  order: number;
}

export default function TeacherCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [publishingCourseId, setPublishingCourseId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    title: '', description: '', duration: '', price: '', level: 'beginner',
    tags: '', prerequisites: '', objectives: ''
  });

  const [contentData, setContentData] = useState({
    title: '',
    description: '',
    type: 'video' as const,
    duration: '',
    content: '',
    file: null as File | null
  });

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/courses');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Create or update course
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        duration: parseInt(formData.duration) || 0,
        price: parseFloat(formData.price) || 0,
        level: formData.level,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        prerequisites: formData.prerequisites ? formData.prerequisites.split(',').map(p => p.trim()) : [],
        objectives: formData.objectives ? formData.objectives.split(',').map(o => o.trim()) : []
      };
      
      const url = editingCourse 
        ? `/api/teacher/courses/${editingCourse._id}` 
        : '/api/teacher/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });
      
      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement');
      
      toast.success(editingCourse ? 'Cours mis à jour' : 'Cours créé avec succès');
      setShowModal(false);
      fetchCourses();
      resetForm();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  // Add or update content
  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    
    setLoading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', contentData.title);
      formDataToSend.append('description', contentData.description || '');
      formDataToSend.append('type', contentData.type);
      formDataToSend.append('duration', contentData.duration || '0');
      if (contentData.type === 'text') {
        formDataToSend.append('content', contentData.content || '');
      }
      if (contentData.file) {
        formDataToSend.append('file', contentData.file);
      }

      const url = editingContent 
        ? `/api/teacher/courses/contents/${editingContent._id}`
        : `/api/teacher/courses/${selectedCourse._id}/contents`;
      const method = editingContent ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: formDataToSend });
      
      if (!res.ok) throw new Error('Erreur lors de l\'ajout du contenu');

      toast.success(editingContent ? 'Leçon mise à jour' : 'Leçon ajoutée avec succès');
      setShowContentModal(false);
      fetchCourses();
      resetContentForm();
    } catch (error) {
      console.error('Error adding content:', error);
      toast.error('Erreur lors de l\'ajout du contenu');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContentData({ ...contentData, file });
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce cours ? Cette action est irréversible.')) return;
    
    try {
      const res = await fetch(`/api/teacher/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      
      toast.success('Cours supprimé avec succès');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Supprimer ce contenu ?')) return;
    
    try {
      const res = await fetch(`/api/teacher/courses/contents/${contentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      
      toast.success('Contenu supprimé avec succès');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handlePublishToggle = async (course: Course) => {
    setPublishingCourseId(course._id);
    try {
      const action = course.isPublished ? 'unpublish' : 'publish';
      const res = await fetch(`/api/teacher/courses/${course._id}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error('Erreur');
      
      toast.success(course.isPublished ? 'Cours dépublié' : 'Cours publié avec succès');
      fetchCourses();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Erreur lors du changement de statut');
    } finally {
      setPublishingCourseId(null);
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', description: '', duration: '', price: '', level: 'beginner',
      tags: '', prerequisites: '', objectives: ''
    });
    setEditingCourse(null);
  };

  const resetContentForm = () => {
    setContentData({ title: '', description: '', type: 'video', duration: '', content: '', file: null });
    setEditingContent(null);
    setSelectedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
  };

  const getContentIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'pdf': return <File className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      beginner: 'bg-emerald-500/20 text-emerald-400',
      intermediate: 'bg-amber-500/20 text-amber-400',
      advanced: 'bg-rose-500/20 text-rose-400'
    };
    return badges[level as keyof typeof badges] || badges.beginner;
  };

  const getLevelText = (level: string) => {
    const texts = {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé'
    };
    return texts[level as keyof typeof texts] || level;
  };

  const publishedCount = courses.filter(c => c.isPublished).length;
  const draftCount = courses.filter(c => !c.isPublished).length;

  if (loading && courses.length === 0) {
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
            Mes cours
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gérez vos formations et leur contenu</p>
        </div>
        <div className="flex gap-3">
          {draftCount > 0 && (
            <button
              onClick={() => {}}
              className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-500/30 transition border border-amber-500/30"
            >
              <Globe className="w-4 h-4" /> Publier tout ({draftCount})
            </button>
          )}
          <button 
            onClick={() => { resetForm(); setShowModal(true); }} 
            className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Créer un cours
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm">Total cours</p>
              <p className="text-3xl font-bold text-white">{courses.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-5 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-sm">Publiés</p>
              <p className="text-3xl font-bold text-white">{publishedCount}</p>
            </div>
            <Globe className="w-8 h-8 text-emerald-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-5 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm">Brouillons</p>
              <p className="text-3xl font-bold text-white">{draftCount}</p>
            </div>
            <Lock className="w-8 h-8 text-amber-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-5 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm">Étudiants</p>
              <p className="text-3xl font-bold text-white">
                {courses.reduce((sum, c) => sum + (c.studentsCount || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-white/5 rounded-2xl p-16 text-center border border-cyan-500/30">
          <BookOpen className="w-20 h-20 text-cyan-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-white mb-2">Aucun cours</h3>
          <p className="text-cyan-400">Commencez par créer votre premier cours</p>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }} 
            className="mt-4 bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-4 py-2 rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Créer un cours
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 transition-all duration-300"
            >
              <div 
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getLevelBadge(course.level)}`}>
                      {getLevelText(course.level)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${course.isPublished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {course.isPublished ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {course.isPublished ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-1">{course.description}</p>
                  <div className="flex gap-4 mt-3 text-cyan-400 text-xs">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration || 0}h</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.studentsCount || 0} étudiants</span>
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {course.contents?.length || 0} leçons</span>
                    {course.price > 0 && <span className="flex items-center gap-1">💰 {course.price} €</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePublishToggle(course); }} 
                    disabled={publishingCourseId === course._id}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-2 ${
                      course.isPublished 
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    } ${publishingCourseId === course._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {publishingCourseId === course._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      course.isPublished ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />
                    )}
                    <span className="text-sm hidden sm:inline">
                      {course.isPublished ? 'Dépublier' : 'Publier'}
                    </span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingCourse(course); setFormData({ 
                      title: course.title, 
                      description: course.description, 
                      duration: course.duration.toString(), 
                      price: course.price.toString(), 
                      level: course.level,
                      tags: course.tags?.join(', ') || '', 
                      prerequisites: course.prerequisites?.join(', ') || '', 
                      objectives: course.objectives?.join(', ') || '' 
                    }); setShowModal(true); }} 
                    className="p-2 hover:bg-white/10 rounded-xl transition"
                  >
                    <Edit className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(course._id); }} 
                    className="p-2 hover:bg-white/10 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-xl transition">
                    {expandedCourse === course._id ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
                  </button>
                </div>
              </div>

              {/* Course Content Expandable */}
              <AnimatePresence>
                {expandedCourse === course._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-cyan-500/30 p-5 bg-cyan-500/5"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        Contenu du cours ({course.contents?.length || 0} leçons)
                      </h4>
                      <button 
                        onClick={() => { setSelectedCourse(course); resetContentForm(); setShowContentModal(true); }} 
                        className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-3 py-1.5 rounded-xl text-sm flex items-center gap-1 hover:shadow-lg transition"
                      >
                        <Plus className="w-3 h-3" /> Ajouter une leçon
                      </button>
                    </div>
                    
                    {course.contents && course.contents.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {course.contents.map((content, idx) => (
                          <div key={content._id} className="bg-black/30 rounded-xl p-3 flex items-center justify-between hover:bg-black/40 transition border border-cyan-500/20">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-xl flex items-center justify-center">
                                {getContentIcon(content.type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">
                                  <span className="text-cyan-400 mr-2">{idx + 1}.</span>
                                  {content.title}
                                </p>
                                {content.description && (
                                  <p className="text-slate-400 text-xs line-clamp-1">{content.description}</p>
                                )}
                                <div className="flex gap-3 mt-1">
                                  {content.duration && (
                                    <p className="text-cyan-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {content.duration} min</p>
                                  )}
                                  {content.fileSize && (
                                    <p className="text-cyan-400 text-xs flex items-center gap-1"><File className="w-3 h-3" /> {(content.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {content.fileUrl && (
                                <a href={content.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-white/10 rounded-xl transition" title="Télécharger">
                                  <Download className="w-4 h-4 text-blue-400" />
                                </a>
                              )}
                              <button 
                                onClick={() => { setEditingContent(content); setContentData({ 
                                  title: content.title, 
                                  description: content.description || '', 
                                  type: content.type, 
                                  duration: content.duration.toString(), 
                                  content: content.content || '', 
                                  file: null 
                                }); setSelectedCourse(course); setShowContentModal(true); }} 
                                className="p-1 hover:bg-white/10 rounded-xl transition"
                              >
                                <Edit className="w-4 h-4 text-cyan-400" />
                              </button>
                              <button 
                                onClick={() => handleDeleteContent(content._id)} 
                                className="p-1 hover:bg-white/10 rounded-xl transition"
                              >
                                <Trash2 className="w-4 h-4 text-rose-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-sm">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        Aucune leçon pour le moment.
                        <br />
                        <button 
                          onClick={() => { setSelectedCourse(course); resetContentForm(); setShowContentModal(true); }} 
                          className="mt-3 text-cyan-400 hover:text-cyan-300 transition inline-flex items-center gap-1"
                        >
                          Cliquez ici pour ajouter votre première leçon <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Création/Modification Cours */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
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
                  <h2 className="text-xl font-bold text-white">{editingCourse ? 'Modifier le cours' : 'Nouveau cours'}</h2>
                  <p className="text-cyan-200 text-sm">Créez une nouvelle formation</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Form fields... (same as before) */}
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Titre *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-1">Durée (heures)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-1">Prix (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Niveau</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Tags (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="react, javascript, web"
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Prérequis (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                    placeholder="connaissances de base en JS, HTML/CSS"
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Objectifs (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={formData.objectives}
                    onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                    placeholder="créer une app React, maîtriser les hooks"
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingCourse ? 'Mettre à jour' : 'Créer le cours')}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/10 text-white py-2.5 rounded-xl font-semibold hover:bg-white/20 transition">Annuler</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ajout/Modification Contenu */}
      <AnimatePresence>
        {showContentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowContentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-violet-600 p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">{editingContent ? 'Modifier la leçon' : 'Ajouter une leçon'}</h2>
                  <p className="text-cyan-200 text-sm">Ajoutez du contenu pédagogique</p>
                </div>
                <button onClick={() => setShowContentModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">✕</button>
              </div>
              
              <form onSubmit={handleAddContent} className="p-6 space-y-5">
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Titre *</label>
                  <input
                    type="text"
                    value={contentData.title}
                    onChange={(e) => setContentData({...contentData, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={contentData.description}
                    onChange={(e) => setContentData({...contentData, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-1">Type</label>
                    <select
                      value={contentData.type}
                      onChange={(e) => setContentData({...contentData, type: e.target.value as any})}
                      className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                    >
                      <option value="video">🎥 Vidéo</option>
                      <option value="audio">🎵 Audio</option>
                      <option value="image">🖼️ Image</option>
                      <option value="text">📝 Texte</option>
                      <option value="pdf">📄 PDF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-1">Durée (minutes)</label>
                    <input
                      type="number"
                      value={contentData.duration}
                      onChange={(e) => setContentData({...contentData, duration: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                    />
                  </div>
                </div>
                
                {contentData.type === 'text' && (
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-1">Contenu texte</label>
                    <textarea
                      rows={6}
                      value={contentData.content}
                      onChange={(e) => setContentData({...contentData, content: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/10 border border-cyan-500/30 rounded-xl text-white"
                      placeholder="Écrivez votre contenu ici..."
                    />
                  </div>
                )}
                
                {(contentData.type === 'video' || contentData.type === 'audio' || contentData.type === 'image' || contentData.type === 'pdf') && (
                  <div>
                    <label className="block text-cyan-400 text-sm font-medium mb-1">Fichier</label>
                    <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-6 text-center hover:border-cyan-500/60 transition cursor-pointer" onClick={() => document.getElementById('fileInput')?.click()}>
                      <input id="fileInput" type="file" onChange={handleFileChange} className="hidden" accept={
                        contentData.type === 'video' ? 'video/*' :
                        contentData.type === 'audio' ? 'audio/*' :
                        contentData.type === 'image' ? 'image/*' :
                        '.pdf'
                      } />
                      <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                      <p className="text-cyan-300 text-sm">Cliquez ou glissez un fichier</p>
                      <p className="text-slate-400 text-xs mt-1">
                        {contentData.type === 'video' && 'MP4, AVI, MOV (max 100MB)'}
                        {contentData.type === 'audio' && 'MP3, WAV, OGG (max 50MB)'}
                        {contentData.type === 'image' && 'JPG, PNG, GIF (max 10MB)'}
                        {contentData.type === 'pdf' && 'PDF (max 20MB)'}
                      </p>
                    </div>
                    
                    {selectedFile && (
                      <div className="mt-3 p-3 bg-cyan-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {contentData.type === 'video' && <Video className="w-4 h-4 text-cyan-400" />}
                            {contentData.type === 'audio' && <Music className="w-4 h-4 text-cyan-400" />}
                            {contentData.type === 'image' && <Image className="w-4 h-4 text-cyan-400" />}
                            {contentData.type === 'pdf' && <File className="w-4 h-4 text-cyan-400" />}
                            <span className="text-white text-sm">{selectedFile.name}</span>
                          </div>
                          <span className="text-cyan-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        {filePreview && (
                          <img src={filePreview} alt="Preview" className="mt-2 max-h-32 rounded-lg object-cover" />
                        )}
                      </div>
                    )}
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-3">
                        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500 to-violet-600 h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-cyan-400 text-xs mt-1 text-center">Upload: {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingContent ? 'Mettre à jour' : 'Ajouter la leçon'}
                      </>
                    )}
                  </button>
                  <button type="button" onClick={() => setShowContentModal(false)} className="flex-1 bg-white/10 text-white py-2.5 rounded-xl font-semibold hover:bg-white/20 transition">Annuler</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}