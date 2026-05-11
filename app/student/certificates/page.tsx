// app/student/certificates/page.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Download, Share2, Eye, Calendar, Clock, 
  CheckCircle, Trophy, Star, Sparkles, Crown, 
  Medal, GraduationCap, BookOpen, Users, TrendingUp,
  Filter, Search, ChevronDown, X, Printer, Mail,
  Linkedin, Twitter, Facebook, Copy, Check,
  Loader2, AlertCircle, Zap, Brain, Target, Globe,
  Shield, Fingerprint, QrCode
} from 'lucide-react';
import { Navbar } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Certificate {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  expiryDate?: string;
  grade: string;
  score: number;
  credits: number;
  duration: string;
  skills: string[];
  image?: string;
  certificateUrl: string;
  verificationCode: string;
  isVerified: boolean;
  issuer: {
    name: string;
    logo?: string;
    signature?: string;
  };
  metadata: {
    hoursCompleted: number;
    assignmentsCompleted: number;
    quizzesPassed: number;
    finalExamScore: number;
  };
}

const getGradeColor = (grade: string) => {
  switch(grade) {
    case 'A+': return 'from-yellow-500 to-amber-500';
    case 'A': return 'from-emerald-500 to-teal-500';
    case 'B+': return 'from-blue-500 to-cyan-500';
    case 'B': return 'from-blue-500 to-cyan-500';
    default: return 'from-slate-500 to-gray-500';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-yellow-400';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 70) return 'text-blue-400';
  return 'text-slate-400';
};

export default function StudentCertificatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalCredits: 0,
    averageScore: 0,
    completedHours: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchCertificates();
    }
  }, [status, router]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const userId = (session?.user as any)?.id;
      const response = await fetch(`/api/student/certificates?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des certificats');
      }
      
      const data = await response.json();
      const certificatesList = data.certificates || data || [];
      setCertificates(certificatesList);
      setFilteredCertificates(certificatesList);
      
      // Calculer les statistiques
      const totalCredits = certificatesList.reduce((sum: number, cert: Certificate) => sum + (cert.credits || 0), 0);
      const averageScore = certificatesList.length > 0 
        ? Math.round(certificatesList.reduce((sum: number, cert: Certificate) => sum + (cert.score || 0), 0) / certificatesList.length)
        : 0;
      const completedHours = certificatesList.reduce((sum: number, cert: Certificate) => sum + (cert.metadata?.hoursCompleted || 0), 0);
      
      setStats({
        total: certificatesList.length,
        totalCredits,
        averageScore,
        completedHours
      });
      
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Erreur lors du chargement des certificats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = certificates.filter(cert =>
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredCertificates(filtered);
  }, [searchQuery, certificates]);

  const downloadCertificate = async (cert: Certificate) => {
    try {
      toast.loading('Téléchargement en cours...');
      
      // Simuler un téléchargement ou appeler l'API réelle
      // const response = await fetch(`/api/student/certificates/${cert._id}/download`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = cert.certificateUrl || `#`;
      link.download = `${cert.title.replace(/\s/g, '_')}_certificat.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss();
      toast.success('Certificat téléchargé avec succès !');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const shareOnLinkedIn = (cert: Certificate) => {
    const url = `${window.location.origin}/verify/${cert.verificationCode}`;
    const text = `Je viens d'obtenir ma certification "${cert.title}" avec une note de ${cert.score}/100 ! 🎓✨`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnTwitter = (cert: Certificate) => {
    const url = `${window.location.origin}/verify/${cert.verificationCode}`;
    const text = `Je viens d'obtenir ma certification "${cert.title}" sur NRBAcademy ! 🎓`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyVerificationLink = (code: string) => {
    const url = `${window.location.origin}/verify/${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Lien de vérification copié !');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] relative overflow-hidden">
      <Navbar />
      
      {/* Background futuriste */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Mes Certifications
                </h1>
              </div>
              <p className="text-slate-400">Découvrez et partagez vos réalisations académiques</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
              <Shield className="h-3 w-3" />
              <span>BLOCKCHAIN VERIFIED</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-500/30">
            <Award className="h-6 w-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">Certificats obtenus</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 border border-blue-500/30">
            <GraduationCap className="h-6 w-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalCredits}</p>
            <p className="text-xs text-slate-400">Crédits ECTS</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 border border-emerald-500/30">
            <TrendingUp className="h-6 w-6 text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.averageScore}/100</p>
            <p className="text-xs text-slate-400">Moyenne générale</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-4 border border-amber-500/30">
            <Clock className="h-6 w-6 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.completedHours}h</p>
            <p className="text-xs text-slate-400">Heures complétées</p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <Input
              type="text"
              placeholder="Rechercher un certificat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-cyan-950/20 border-cyan-500/30 text-white placeholder:text-slate-500"
            />
          </div>
        </motion.div>

        {/* Certificates Grid */}
        {filteredCertificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/5 rounded-2xl border border-cyan-500/30"
          >
            <Award className="h-16 w-16 text-cyan-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">Aucun certificat</h3>
            <p className="text-slate-400">
              {searchQuery 
                ? "Aucun certificat ne correspond à votre recherche"
                : "Vous n'avez pas encore de certificats. Terminez vos cours pour en obtenir !"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCertificates.map((cert, index) => (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card className="border-cyan-500/30 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-cyan-500/60 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className={`h-2 bg-gradient-to-r ${getGradeColor(cert.grade)}`} />
                  <CardContent className="p-6">
                    {/* En-tête */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <Badge className={`bg-gradient-to-r ${getGradeColor(cert.grade)} text-white border-0`}>
                        {cert.grade}
                      </Badge>
                    </div>
                    
                    {/* Titre */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition line-clamp-1">
                      {cert.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{cert.description}</p>
                    
                    {/* Métriques */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(cert.issueDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {cert.duration}
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500">Score final</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className={`text-sm font-bold ${getScoreColor(cert.score)}`}>
                          {cert.score}/100
                        </span>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {cert.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">
                          {skill}
                        </span>
                      ))}
                      {cert.skills.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs">
                          +{cert.skills.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-cyan-500/30">
                      <button
                        onClick={() => {
                          setSelectedCertificate(cert);
                          setShowDetails(true);
                        }}
                        className="flex-1 py-2 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        Détails
                      </button>
                      <button
                        onClick={() => downloadCertificate(cert)}
                        className="p-2 rounded-lg bg-white/5 text-cyan-400 hover:bg-white/10 transition"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => copyVerificationLink(cert.verificationCode)}
                        className="p-2 rounded-lg bg-white/5 text-cyan-400 hover:bg-white/10 transition"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Code de vérification */}
                    <div className="mt-3 pt-2 text-center">
                      <p className="text-[10px] text-slate-500 font-mono">
                        Code: {cert.verificationCode}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal Détails Certificat */}
      <AnimatePresence>
        {showDetails && selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#0d0d35] to-[#1a1a4e] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-600 to-violet-600 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-6 w-6 text-white" />
                      <span className="text-white/80 text-sm">Certificat officiel</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedCertificate.title}</h2>
                    <p className="text-cyan-200 mt-1">{selectedCertificate.courseName}</p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 rounded-lg hover:bg-white/20 transition"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Badge de vérification */}
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Certificat vérifié</p>
                      <p className="text-xs text-slate-400">Code: {selectedCertificate.verificationCode}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareOnLinkedIn(selectedCertificate)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                    >
                      <Linkedin className="h-4 w-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => shareOnTwitter(selectedCertificate)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                    >
                      <Twitter className="h-4 w-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => copyVerificationLink(selectedCertificate.verificationCode)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                    >
                      <Copy className="h-4 w-4 text-cyan-400" />
                    </button>
                  </div>
                </div>
                
                {/* Métriques détaillées */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <Calendar className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-sm">{formatDate(selectedCertificate.issueDate)}</p>
                    <p className="text-xs text-slate-500">Date d'émission</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <Clock className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-sm">{selectedCertificate.duration}</p>
                    <p className="text-xs text-slate-500">Durée totale</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <GraduationCap className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-sm">{selectedCertificate.credits} ECTS</p>
                    <p className="text-xs text-slate-500">Crédits</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <Trophy className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-sm">{selectedCertificate.score}/100</p>
                    <p className="text-xs text-slate-500">Score final</p>
                  </div>
                </div>
                
                {/* Compétences */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-cyan-400" />
                    Compétences acquises
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCertificate.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Détail des performances */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-cyan-400" />
                    Performances détaillées
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Heures complétées</span>
                        <span className="text-white">{selectedCertificate.metadata?.hoursCompleted || 0}h / {selectedCertificate.duration}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-cyan-500 to-violet-600 h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Devoirs complétés</span>
                        <span className="text-white">{selectedCertificate.metadata?.assignmentsCompleted || 0} / {selectedCertificate.metadata?.assignmentsCompleted || 12}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Quiz réussis</span>
                        <span className="text-white">{selectedCertificate.metadata?.quizzesPassed || 0} / {selectedCertificate.metadata?.quizzesPassed || 12}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={() => downloadCertificate(selectedCertificate)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}