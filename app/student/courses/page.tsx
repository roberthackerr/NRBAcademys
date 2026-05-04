// app/student/courses/page.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Download, BookOpen, Video, Music, Image, FileText, Play, Clock, 
  User, ChevronRight, X, Calendar, Target, Award, CheckCircle,
  ExternalLink, Eye, Heart, Share2, Star, Filter, Search, 
  TrendingUp, GraduationCap, Zap, Sparkles, Crown, Gem,
  Shield, Globe, Coffee, Gift, Rocket, Trophy, Medal,
  Volume2, File, Users, Layers, Code, Palette, Briefcase, Database,
  ChevronLeft, Menu, Maximize2, Minimize2, VolumeX, Volume1,
  Settings, SkipBack, SkipForward, Pause, ArrowLeft, ShoppingCart,
  CreditCard, Wallet, BadgeCheck, AlertCircle, Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Course {
  _id: string;
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isPublished: boolean;
  studentsCount: number;
  contents?: Content[];
  teacher?: {
    firstName: string;
    lastName: string;
  };
  thumbnailUrl?: string;
  createdAt: string;
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

export default function StudentCourses() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, { completed: string[]; lastLesson: string; progressPercentage: number }>>({});
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedEnrollCourse, setSelectedEnrollCourse] = useState<Course | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch all published courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setCourses(data.filter((c: Course) => c.isPublished === true));
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch enrolled courses for current student
  const fetchEnrolledCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/student/enrolled-courses');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setEnrolledCourses(data);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  }, []);

  // Load progress from localStorage
  const loadProgress = useCallback(() => {
    const saved = localStorage.getItem('courseProgress');
    if (saved) {
      setCourseProgress(JSON.parse(saved));
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((courseId: string, lessonId: string) => {
    const course = selectedCourse;
    const completedLessons = [...(courseProgress[courseId]?.completed || []), lessonId];
    const progressPercentage = Math.round((completedLessons.length / (course?.contents?.length || 1)) * 100);
    
    const newProgress = {
      ...courseProgress,
      [courseId]: {
        completed: completedLessons,
        lastLesson: lessonId,
        lastUpdated: new Date().toISOString(),
        progressPercentage
      }
    };
    setCourseProgress(newProgress);
    localStorage.setItem('courseProgress', JSON.stringify(newProgress));
  }, [courseProgress, selectedCourse]);

  const markLessonComplete = useCallback((courseId: string, lessonId: string) => {
    if (!courseProgress[courseId]?.completed?.includes(lessonId)) {
      saveProgress(courseId, lessonId);
      toast.success('Leçon complétée !');
    }
  }, [courseProgress, saveProgress]);

  const getProgressPercentage = useCallback((course: Course) => {
    if (!course?.contents || course.contents.length === 0) return 0;
    const completed = courseProgress[course._id]?.completed?.length || 0;
    return Math.round((completed / course.contents.length) * 100);
  }, [courseProgress]);

  const isEnrolled = useCallback((courseId: string) => {
    return enrolledCourses.some(c => c._id === courseId);
  }, [enrolledCourses]);

  const handleEnroll = (course: Course) => {
    setSelectedEnrollCourse(course);
    setShowEnrollModal(true);
  };

  const confirmEnroll = async () => {
    if (!selectedEnrollCourse) return;
    
    setEnrolling(true);
    try {
      const res = await fetch(`/api/student/courses/${selectedEnrollCourse._id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error('Erreur');
      
      toast.success(`Inscription réussie au cours "${selectedEnrollCourse.title}" !`);
      setShowEnrollModal(false);
      await fetchEnrolledCourses();
      await fetchCourses();
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setEnrolling(false);
      setSelectedEnrollCourse(null);
    }
  };

  const startCourse = (course: Course) => {
    if (!isEnrolled(course._id)) {
      handleEnroll(course);
      return;
    }
    
    const lastCompleted = courseProgress[course._id]?.lastLesson;
    let startIndex = 0;
    
    if (lastCompleted && course.contents) {
      const foundIndex = course.contents.findIndex(c => c._id === lastCompleted);
      if (foundIndex !== -1) {
        startIndex = foundIndex + 1;
        if (startIndex >= course.contents.length) {
          startIndex = 0;
        }
      }
    }
    
    setSelectedCourse(course);
    setSelectedContent(course.contents?.[startIndex] || null);
    setCurrentLessonIndex(startIndex);
    setShowPlayer(true);
    setShowModal(false);
  };

  const continueCourse = (course: Course) => {
    const lastCompleted = courseProgress[course._id]?.lastLesson;
    let startIndex = 0;
    
    if (lastCompleted && course.contents) {
      const foundIndex = course.contents.findIndex(c => c._id === lastCompleted);
      if (foundIndex !== -1) {
        startIndex = foundIndex;
      }
    }
    
    setSelectedCourse(course);
    setSelectedContent(course.contents?.[startIndex] || null);
    setCurrentLessonIndex(startIndex);
    setShowPlayer(true);
    setShowModal(false);
  };

  const nextLesson = () => {
    if (selectedCourse && selectedCourse.contents && currentLessonIndex < selectedCourse.contents.length - 1) {
      const nextIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(nextIndex);
      setSelectedContent(selectedCourse.contents[nextIndex]);
      
      const currentLesson = selectedCourse.contents[currentLessonIndex];
      if (currentLesson && !courseProgress[selectedCourse._id]?.completed?.includes(currentLesson._id)) {
        markLessonComplete(selectedCourse._id, currentLesson._id);
      }
    }
  };

  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      const prevIndex = currentLessonIndex - 1;
      setCurrentLessonIndex(prevIndex);
      setSelectedContent(selectedCourse!.contents![prevIndex]);
    }
  };

  const filterAndSortCourses = useCallback(() => {
    let filtered = [...courses];
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.tags && c.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(c => c.level === selectedLevel);
    }
    
    switch(sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    
    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedLevel, sortBy]);

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
    loadProgress();
  }, [fetchCourses, fetchEnrolledCourses, loadProgress]);

  useEffect(() => {
    filterAndSortCourses();
  }, [filterAndSortCourses]);

  const getContentIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const badges: Record<string, { color: string; text: string; icon: string }> = {
      beginner: { color: 'from-emerald-400 to-emerald-600', text: 'Débutant', icon: '🌱' },
      intermediate: { color: 'from-amber-400 to-amber-600', text: 'Intermédiaire', icon: '⚡' },
      advanced: { color: 'from-rose-400 to-rose-600', text: 'Avancé', icon: '🚀' }
    };
    return badges[level] || badges.beginner;
  };

  const stats = {
    total: courses.length,
    inProgress: Object.keys(courseProgress).length,
    enrolled: enrolledCourses.length,
    certificates: 0
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-cyan-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <p className="text-white mt-6 text-lg font-medium">Chargement des cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-8 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-violet-600/20 p-8 border border-cyan-500/30">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-cyan-500 to-violet-600 p-2 rounded-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Ma Bibliothèque
              </h1>
              <p className="text-cyan-400">Découvrez et maîtrisez de nouvelles compétences</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-cyan-500/30">
              <BookOpen className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-cyan-400 text-xs">Cours disponibles</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-cyan-500/30">
              <Play className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{stats.enrolled}</p>
              <p className="text-cyan-400 text-xs">Inscrits</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-cyan-500/30">
              <Award className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              <p className="text-cyan-400 text-xs">En cours</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-cyan-500/30">
              <Trophy className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{stats.certificates}</p>
              <p className="text-cyan-400 text-xs">Certificats</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 mb-8 border border-cyan-500/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Rechercher un cours, une compétence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-cyan-500/30 rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Tous niveaux</option>
              <option value="beginner">🌱 Débutant</option>
              <option value="intermediate">⚡ Intermédiaire</option>
              <option value="advanced">🚀 Avancé</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="popular">⭐ Les plus populaires</option>
              <option value="newest">🆕 Les plus récents</option>
              <option value="price_asc">💰 Prix croissant</option>
              <option value="price_desc">💰 Prix décroissant</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${showFilters ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 pt-4 border-t border-cyan-500/30"
            >
              <div className="flex flex-wrap gap-2">
                {['Tous', 'Développement', 'Design', 'Business', 'Marketing', 'Data'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === 'Tous' ? 'all' : cat.toLowerCase())}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      (selectedCategory === (cat === 'Tous' ? 'all' : cat.toLowerCase()))
                        ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white'
                        : 'bg-white/10 text-cyan-400 hover:bg-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-16 text-center border border-cyan-500/30"
        >
          <div className="text-8xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold text-white mb-2">Aucun cours trouvé</h3>
          <p className="text-cyan-400">Aucun cours ne correspond à vos critères de recherche</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedLevel('all');
              setSelectedCategory('all');
            }}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-xl hover:shadow-lg transition"
          >
            Réinitialiser les filtres
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => {
            const levelBadge = getLevelBadge(course.level);
            const progress = getProgressPercentage(course);
            const hasProgress = progress > 0;
            const enrolled = isEnrolled(course._id);
            
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredCard(course._id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 cursor-pointer"
                onClick={() => { setSelectedCourse(course); setShowModal(true); }}
              >
                <div className="relative h-48 bg-gradient-to-r from-cyan-600/30 to-violet-600/30 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-7xl transform group-hover:scale-110 transition-transform duration-500">
                      {course.thumbnailUrl || '📚'}
                    </div>
                  </div>
                  
                  {hasProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 flex gap-2">
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${levelBadge.color} text-white shadow-lg flex items-center gap-1`}>
                      <span>{levelBadge.icon}</span> {levelBadge.text}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur rounded-lg px-2 py-1">
                      <Clock className="w-3 h-3 text-white" />
                      <span className="text-white text-xs">{course.duration || 0}h</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-3 left-3">
                    <div className="bg-black/50 backdrop-blur rounded-lg px-2 py-1">
                      <span className="text-white text-xs font-bold">{course.price === 0 ? 'GRATUIT' : `${course.price} €`}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition line-clamp-1 flex-1">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-1 bg-yellow-500/20 rounded-lg px-2 py-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-medium">4.8</span>
                    </div>
                  </div>
                  
                  <p className="text-cyan-200 text-sm mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-2 text-cyan-400 text-xs mb-3">
                    <User className="w-3 h-3" />
                    <span>{course.teacher?.firstName} {course.teacher?.lastName}</span>
                  </div>
                  
                  {course.contents && course.contents.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.contents.slice(0, 4).map((content) => (
                        <div key={content._id} className="w-7 h-7 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition">
                          {getContentIcon(content.type)}
                        </div>
                      ))}
                      {course.contents.length > 4 && (
                        <div className="w-7 h-7 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 text-xs font-medium">
                          +{course.contents.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-white/10 rounded-full text-cyan-400 text-xs">
                          #{tag}
                        </span>
                      ))}
                      {course.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-cyan-400 text-xs">
                          +{course.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-cyan-500/30">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-cyan-400 text-xs">
                        <Users className="w-3 h-3" />
                        <span>{course.studentsCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-cyan-400 text-xs">
                        <Play className="w-3 h-3" />
                        <span>{course.contents?.length || 0} leçons</span>
                      </div>
                    </div>
                    
                    {enrolled ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); continueCourse(course); }}
                        className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shadow-lg hover:shadow-cyan-500/25 transition"
                      >
                        <Play className="w-3 h-3" /> {hasProgress ? `Continuer (${progress}%)` : 'Commencer'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEnroll(course); }}
                        className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shadow-lg hover:shadow-cyan-500/25 transition"
                      >
                        <ShoppingCart className="w-3 h-3" /> S'inscrire
                      </button>
                    )}
                  </div>
                </div>
                
                {hoveredCard === course._id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-cyan-900/90 to-transparent flex items-end p-6"
                  >
                    <div className="w-full">
                      {enrolled ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); continueCourse(course); }}
                          className="w-full bg-white text-cyan-900 py-2 rounded-xl font-semibold flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" /> {hasProgress ? 'Continuer le cours' : 'Commencer le cours'}
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEnroll(course); }}
                          className="w-full bg-white text-cyan-900 py-2 rounded-xl font-semibold flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" /> S'inscrire maintenant
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Détails du cours */}
      <AnimatePresence>
        {showModal && selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
              ref={modalRef}
            >
              <div className="relative h-64 bg-gradient-to-r from-cyan-600 to-violet-600">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl">{selectedCourse.thumbnailUrl || '📚'}</div>
                </div>
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition z-10">
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getLevelBadge(selectedCourse.level).color} text-white`}>
                      {getLevelBadge(selectedCourse.level).text}
                    </span>
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-black/50 text-white">
                      {selectedCourse.duration || 0} heures
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">{selectedCourse.title}</h2>
                  <p className="text-cyan-200 mt-1">Par {selectedCourse.teacher?.firstName} {selectedCourse.teacher?.lastName}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-white/10 rounded-xl p-4 mb-6 flex items-center justify-between border border-cyan-500/30">
                  <div>
                    <span className="text-3xl font-bold text-white">{selectedCourse.price === 0 ? 'GRATUIT' : `${selectedCourse.price} €`}</span>
                    {selectedCourse.price > 0 && <span className="text-cyan-400 text-sm ml-2">TTC</span>}
                  </div>
                  {isEnrolled(selectedCourse._id) ? (
                    <button onClick={() => continueCourse(selectedCourse)} className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2">
                      <Play className="w-5 h-5" /> {getProgressPercentage(selectedCourse) > 0 ? `Continuer (${getProgressPercentage(selectedCourse)}%)` : 'Commencer le cours'}
                    </button>
                  ) : (
                    <button onClick={() => handleEnroll(selectedCourse)} className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" /> S'inscrire
                    </button>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2 text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" /> Description
                  </h3>
                  <p className="text-cyan-200 leading-relaxed">{selectedCourse.description}</p>
                </div>

                {selectedCourse.contents && selectedCourse.contents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3 text-lg flex items-center gap-2">
                      <Play className="w-5 h-5 text-cyan-400" /> Contenu du cours ({selectedCourse.contents.length} leçons)
                    </h3>
                    <div className="space-y-2">
                      {selectedCourse.contents.map((content, idx) => (
                        <div key={content._id} className={`bg-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition group ${courseProgress[selectedCourse._id]?.completed?.includes(content._id) ? 'border border-green-500/30' : ''}`}>
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/30 transition">
                              {getContentIcon(content.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                <span className="text-cyan-400 mr-2">#{idx + 1}</span>
                                {content.title}
                                {courseProgress[selectedCourse._id]?.completed?.includes(content._id) && <CheckCircle className="w-3 h-3 text-green-400 inline ml-2" />}
                              </p>
                              {content.description && <p className="text-cyan-400 text-xs mt-0.5">{content.description}</p>}
                              <div className="flex items-center gap-3 mt-1">
                                {content.duration && <p className="text-cyan-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {content.duration} min</p>}
                                {content.fileSize && <p className="text-cyan-400 text-xs flex items-center gap-1"><File className="w-3 h-3" /> {(content.fileSize / 1024 / 1024).toFixed(2)} MB</p>}
                              </div>
                            </div>
                          </div>
                          {content.fileUrl && (
                            <a href={content.fileUrl} download onClick={(e) => e.stopPropagation()} className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition" title="Télécharger">
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-2 text-sm">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-400 text-sm">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {getProgressPercentage(selectedCourse) > 0 && (
                  <div className="mt-4 bg-white/10 rounded-lg p-4 border border-cyan-500/30">
                    <p className="text-white text-sm mb-2">Votre progression</p>
                    <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-violet-600 h-2 rounded-full transition-all duration-300" style={{ width: `${getProgressPercentage(selectedCourse)}%` }} />
                    </div>
                    <p className="text-cyan-400 text-xs mt-2">{getProgressPercentage(selectedCourse)}% du cours complété</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'inscription */}
      <AnimatePresence>
        {showEnrollModal && selectedEnrollCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowEnrollModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl max-w-md w-full shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-cyan-600 to-violet-600 p-6 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <h2 className="text-xl font-bold">Confirmation d'inscription</h2>
                  </div>
                  <button onClick={() => setShowEnrollModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-3">{selectedEnrollCourse.thumbnailUrl || '📚'}</div>
                  <h3 className="text-xl font-bold text-white">{selectedEnrollCourse.title}</h3>
                  <p className="text-cyan-400 text-sm mt-1">{selectedEnrollCourse.description?.substring(0, 100)}</p>
                </div>

                <div className="bg-white/10 rounded-xl p-4 mb-6 space-y-2 border border-cyan-500/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Durée :</span>
                    <span className="text-white font-medium">{selectedEnrollCourse.duration || 0} heures</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Leçons :</span>
                    <span className="text-white font-medium">{selectedEnrollCourse.contents?.length || 0} leçons</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Prix :</span>
                    <span className="text-white font-bold text-lg">
                      {selectedEnrollCourse.price === 0 ? 'GRATUIT' : `${selectedEnrollCourse.price} €`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Niveau :</span>
                    <span className="text-white">{getLevelBadge(selectedEnrollCourse.level).text}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={confirmEnroll}
                    disabled={enrolling}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" /> Confirmer l'inscription
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowEnrollModal(false)}
                    className="flex-1 bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Modal */}
      <AnimatePresence>
        {showPlayer && selectedCourse && selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col"
          >
            <div className="bg-gradient-to-r from-cyan-600 to-violet-600 p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowPlayer(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div>
                  <h2 className="text-white font-bold">{selectedCourse.title}</h2>
                  <p className="text-cyan-200 text-sm">
                    Leçon {currentLessonIndex + 1} / {selectedCourse.contents?.length || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-lg px-3 py-1">
                  <span className="text-white text-sm">
                    Progression: {getProgressPercentage(selectedCourse)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row">
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedContent.type === 'video' && selectedContent.fileUrl && (
                  <div className="bg-black rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      controls
                      className="w-full h-auto max-h-[60vh]"
                      src={selectedContent.fileUrl}
                      onEnded={() => nextLesson()}
                    />
                  </div>
                )}

                {selectedContent.type === 'audio' && selectedContent.fileUrl && (
                  <div className="bg-gradient-to-r from-cyan-900 to-violet-900 rounded-xl p-8 text-center">
                    <Music className="w-24 h-24 text-cyan-400 mx-auto mb-4" />
                    <audio controls className="w-full">
                      <source src={selectedContent.fileUrl} />
                    </audio>
                  </div>
                )}

                {selectedContent.type === 'image' && selectedContent.fileUrl && (
                  <div className="text-center">
                    <img 
                      src={selectedContent.fileUrl}
                      alt={selectedContent.title}
                      className="max-w-full max-h-[60vh] mx-auto rounded-xl"
                    />
                  </div>
                )}

                {selectedContent.type === 'text' && (
                  <div className="bg-white/10 rounded-xl p-8">
                    <div className="prose prose-invert max-w-none">
                      <h3 className="text-white text-xl font-bold mb-4">{selectedContent.title}</h3>
                      <p className="text-cyan-200 whitespace-pre-wrap">{selectedContent.content}</p>
                    </div>
                  </div>
                )}

                {selectedContent.type === 'pdf' && selectedContent.fileUrl && (
                  <div className="text-center">
                    <FileText className="w-24 h-24 text-cyan-400 mx-auto mb-4" />
                    <a 
                      href={selectedContent.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Ouvrir le PDF
                    </a>
                  </div>
                )}

                <div className="mt-6 bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">{selectedContent.title}</h3>
                  <p className="text-cyan-200 text-sm">{selectedContent.description}</p>
                </div>

                <div className="flex justify-between gap-4 mt-6">
                  <button
                    onClick={prevLesson}
                    disabled={currentLessonIndex === 0}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${
                      currentLessonIndex === 0
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Leçon précédente
                  </button>
                  
                  <button
                    onClick={() => markLessonComplete(selectedCourse._id, selectedContent._id)}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-lg hover:shadow-lg transition"
                  >
                    <CheckCircle className="w-4 h-4" /> Marquer comme terminée
                  </button>
                  
                  <button
                    onClick={nextLesson}
                    disabled={currentLessonIndex === (selectedCourse.contents?.length || 0) - 1}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${
                      currentLessonIndex === (selectedCourse.contents?.length || 0) - 1
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Leçon suivante <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-80 bg-black/50 border-l border-cyan-500/30 p-4 overflow-y-auto max-h-[calc(100vh-70px)]">
                <h3 className="text-white font-semibold mb-4">Contenu du cours</h3>
                <div className="space-y-2">
                  {selectedCourse.contents?.map((content, idx) => {
                    const isCompleted = courseProgress[selectedCourse._id]?.completed?.includes(content._id);
                    const isCurrent = idx === currentLessonIndex;
                    
                    return (
                      <button
                        key={content._id}
                        onClick={() => {
                          setCurrentLessonIndex(idx);
                          setSelectedContent(content);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${
                          isCurrent
                            ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white'
                            : isCompleted
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{content.title}</p>
                          {content.duration && <p className="text-xs opacity-75">{content.duration} min</p>}
                        </div>
                        {getContentIcon(content.type)}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-cyan-500/30">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white text-sm">Progression du cours</p>
                    <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-violet-600 h-2 rounded-full transition-all duration-300" style={{ width: `${getProgressPercentage(selectedCourse)}%` }} />
                    </div>
                    <p className="text-cyan-400 text-xs mt-2">{getProgressPercentage(selectedCourse)}% complété</p>
                    {getProgressPercentage(selectedCourse) === 100 && (
                      <div className="mt-3 bg-yellow-500/20 rounded-lg p-2 text-center">
                        <Trophy className="w-4 h-4 text-yellow-400 inline mr-1" />
                        <span className="text-yellow-300 text-xs">Félicitations ! Cours complété !</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}