// app/universities/map/page.tsx - Version avec données réelles MongoDB

"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Compass, Target, Zap, Sparkles,
  Search, Filter, Layers, Maximize2, Minimize2,
  Sun, Moon, Cloud, CloudRain, Wind, Thermometer,
  Building2, GraduationCap, Users, BookOpen, Award,
  Star, Heart, Share2, Info, X, Menu, ChevronRight,
  Globe, Map, Satellite, Locate, ZoomIn, ZoomOut,
  Volume2, VolumeX, Radio, Network, Cpu, Database,
  Loader2, AlertCircle, TrendingUp, Trophy, ChevronLeft
} from 'lucide-react';
import { Navbar } from '@/components/nav';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    L: any;
  }
}

interface University {
  _id: string;
  name: string;
  name_en?: string;
  location: string;
  country: string;
  continent: string;
  lat?: number;
  lng?: number;
  logo?: string | null;
  studentsCount?: number;
  programsCount: number;
  partnerships?: number;
  ranking?: number;
  rating?: number;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  status?: string;
  type?: 'public' | 'private';
}

// Données réelles depuis MongoDB
const actualUniversitiesData: University[] = [
  {
    _id: "69fa3b1c6f189b378f7cc4db",
    name: "Université d'Antananarivo",
    name_en: "",
    location: "Antananarivo",
    country: "Madagascar",
    continent: "Afrique",
    lat: -18.8792,
    lng: 47.5079,
  //  studentsCount: 25000,
    programsCount: 4,
    partnerships: 45,
    ranking: 8,
    rating: 4.5,
    type: "public",
    website: "",
    email: "vohitsaina@univ-antananarivo.mg",
    phone: "+261 20 22 326 39",
    address: "Antananarivo",
    postalCode: "101",
    status: "active"
  },
  {
    _id: "69fa43af93f2e1375d272220",
    name: "Université de Vakinankaratra",
    name_en: "",
    location: "Antsirabe",
    country: "Madagascar",
    continent: "Afrique",
    lat: -19.8667,
    lng: 47.0333,
  //  studentsCount: 8000,
    programsCount: 4,
    partnerships: 15,
    ranking: 20,
    rating: 3.8,
    type: "public",
    website: "",
    email: "univ-vakinankaratra@gmail.com",
    phone: "",
    address: "Antsirabe",
    postalCode: "110",
    status: "active"
  }
];

// Données supplémentaires pour la démonstration (à remplacer par vos données réelles)
const additionalUniversities: University[] = [
  {
    _id: "univ_fianarantsoa",
    name: "Université de Fianarantsoa",
    name_en: "University of Fianarantsoa",
    location: "Fianarantsoa",
    country: "Madagascar",
    continent: "Afrique",
    lat: -21.4544,
    lng: 47.0855,
  //  studentsCount: 15000,
    programsCount: 80,
    partnerships: 25,
    ranking: 12,
    rating: 4.2,
    type: "public",
    email: "contact@univ-fianar.mg"
  },
  {
    _id: "univ_toamasina",
    name: "Université de Toamasina",
    name_en: "University of Toamasina",
    location: "Toamasina",
    country: "Madagascar",
    continent: "Afrique",
    lat: -18.1445,
    lng: 49.3958,
  //  studentsCount: 12000,
    programsCount: 65,
    partnerships: 20,
    ranking: 15,
    rating: 4.0,
    type: "public",
    email: "contact@univ-toamasina.mg"
  },
  {
    _id: "univ_mahajanga",
    name: "Université de Mahajanga",
    name_en: "University of Mahajanga",
    location: "Mahajanga",
    country: "Madagascar",
    continent: "Afrique",
    lat: -15.7167,
    lng: 46.3167,
  //  studentsCount: 10000,
    programsCount: 55,
    partnerships: 18,
    ranking: 18,
    rating: 3.9,
    type: "public",
    email: "contact@univ-mahajanga.mg"
  },
  {
    _id: "univ_paris_sorbonne",
    name: "Université Sorbonne Paris Nord",
    name_en: "Sorbonne Paris North University",
    location: "Paris",
    country: "France",
    continent: "Europe",
    lat: 48.9048,
    lng: 2.3789,
    studentsCount: 35000,
    programsCount: 200,
    partnerships: 120,
    ranking: 3,
    rating: 4.8,
    type: "public",
    email: "contact@sorbonne.fr"
  },
  {
    _id: "univ_ubc",
    name: "University of British Columbia",
    name_en: "University of British Columbia",
    location: "Vancouver",
    country: "Canada",
    continent: "Amérique du Nord",
    lat: 49.2606,
    lng: -123.246,
    studentsCount: 45000,
    programsCount: 250,
    partnerships: 180,
    ranking: 2,
    rating: 4.9,
    type: "public"
  },
  {
    _id: "univ_capetown",
    name: "University of Cape Town",
    name_en: "University of Cape Town",
    location: "Cape Town",
    country: "Afrique du Sud",
    continent: "Afrique",
    lat: -33.9575,
    lng: 18.4606,
    studentsCount: 28000,
    programsCount: 150,
    partnerships: 90,
    ranking: 5,
    rating: 4.6,
    type: "public"
  },
  {
    _id: "univ_nus",
    name: "National University of Singapore",
    name_en: "National University of Singapore",
    location: "Singapore",
    country: "Singapore",
    continent: "Asie",
    lat: 1.2966,
    lng: 103.7764,
    studentsCount: 38000,
    programsCount: 220,
    partnerships: 150,
    ranking: 1,
    rating: 4.9,
    type: "public"
  },
  {
    _id: "univ_oxford",
    name: "University of Oxford",
    name_en: "University of Oxford",
    location: "Oxford",
    country: "Royaume-Uni",
    continent: "Europe",
    lat: 51.7548,
    lng: -1.2544,
    studentsCount: 26000,
    programsCount: 300,
    partnerships: 200,
    ranking: 4,
    rating: 4.9,
    type: "public"
  },
  {
    _id: "univ_harvard",
    name: "Harvard University",
    name_en: "Harvard University",
    location: "Cambridge",
    country: "USA",
    continent: "Amérique du Nord",
    lat: 42.3744,
    lng: -71.1169,
    studentsCount: 36000,
    programsCount: 280,
    partnerships: 220,
    ranking: 1,
    rating: 5.0,
    type: "private"
  }
];

const allUniversities = [...actualUniversitiesData, ...additionalUniversities];

// Positions fixes pour éviter les problèmes d'hydratation
const FIXED_POSITIONS = Array.from({ length: 50 }, (_, i) => {
  const seed1 = ((i * 7 + 13) % 97) / 97;
  const seed2 = ((i * 11 + 29) % 89) / 89;
  const seed3 = ((i * 3 + 5) % 83) / 83;
  const seed4 = ((i * 17 + 7) % 79) / 79;
  return {
    left: `${seed1 * 100}%`,
    top: `${seed2 * 100}%`,
    duration: 3 + seed3 * 5,
    delay: seed4 * 5
  };
});

export default function UniversitiesMapPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>(allUniversities);
  const [hoveredUniversity, setHoveredUniversity] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ranking' | 'students' | 'rating'>('ranking');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const filteredRef = useRef<University[]>(allUniversities);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Chargement de Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => setMapLoaded(true);
        script.onerror = () => {
          setMapError('Impossible de charger la carte');
          toast.error('Erreur de chargement de la carte');
        };
        document.head.appendChild(script);
      } else if (window.L) {
        setMapLoaded(true);
      }
    };
    loadLeaflet();
  }, []);

  // Initialisation de la carte
  useEffect(() => {
    if (!mapLoaded || !window.L || !mapRef.current || mapInstanceRef.current) return;

    try {
      const L = window.L;

      mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 2
      }).addTo(mapInstanceRef.current);

      L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);

      const locateControl = L.control({ position: 'topleft' });
      locateControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = '📍';
        div.style.cssText = 'background: rgba(0,0,0,0.8); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 4px; border: 1px solid rgba(6,182,212,0.3); color: #06b6d4; font-size: 18px; backdrop-filter: blur(10px);';
        div.onclick = () => mapInstanceRef.current.locate({ setView: true, maxZoom: 15 });
        return div;
      };
      locateControl.addTo(mapInstanceRef.current);

      setIsMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError("Erreur lors de l'initialisation de la carte");
    }
  }, [mapLoaded]);

  const addMarkersToMap = useCallback(() => {
    if (!mapInstanceRef.current || !window.L || !isMapReady) return;

    try {
      const L = window.L;

      markersRef.current.forEach(marker => marker?.remove?.());
      markersRef.current = [];

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pulse"></div><div class="marker-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
        iconSize: [40, 40],
        popupAnchor: [0, -20]
      });

      filteredRef.current.forEach(uni => {
        if (uni.lat && uni.lng) {
          const marker = L.marker([uni.lat, uni.lng], { icon: customIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div class="custom-popup">
                <div class="popup-header">
                  <strong>${uni.name}</strong>
                  <span class="popup-country">${uni.country}</span>
                </div>
                <div class="popup-stats">
                  <span>🎓 ${uni.studentsCount?.toLocaleString()} étudiants</span>
                  <span>📚 ${uni.programsCount} programmes</span>
                </div>
                <div class="popup-rating">
                  ${'★'.repeat(Math.floor(uni.rating || 0))}${'☆'.repeat(5 - Math.floor(uni.rating || 0))}
                </div>
                <a href="/universities/${uni._id}" class="popup-link">Voir détails →</a>
              </div>
            `, { className: 'futuristic-popup' });

          marker.on('mouseover', () => setHoveredUniversity(uni._id));
          marker.on('mouseout', () => setHoveredUniversity(null));
          marker.on('click', () => setSelectedUniversity(uni));

          markersRef.current.push(marker);
        }
      });
    } catch (error) {
      console.error('Error adding markers:', error);
    }
  }, [isMapReady]);

  // Filtrage
  useEffect(() => {
    let filtered = allUniversities.filter(uni =>
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (uni.name_en && uni.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      uni.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.continent.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedContinent !== 'all') {
      filtered = filtered.filter(uni => uni.continent === selectedContinent);
    }

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'ranking') return (a.ranking || 999) - (b.ranking || 999);
      if (sortBy === 'students') return b.studentsCount! - a.studentsCount!;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    filteredRef.current = filtered;
    setFilteredUniversities(filtered);

    if (isMapReady) addMarkersToMap();
  }, [searchQuery, selectedContinent, sortBy, isMapReady, addMarkersToMap]);

  useEffect(() => {
    if (isMapReady) addMarkersToMap();
  }, [isMapReady, addMarkersToMap]);

  // Changement de fond de carte
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !isMapReady) return;

    try {
      const L = window.L;
      const tileLayers = {
        streets: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      };
      const attribution = {
        streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        satellite: '&copy; <a href="https://www.esri.com/">Esri</a>'
      };

      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      L.tileLayer(tileLayers[mapLayer], {
        attribution: attribution[mapLayer],
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 2
      }).addTo(mapInstanceRef.current);

      addMarkersToMap();
    } catch (error) {
      console.error('Error changing map layer:', error);
    }
  }, [mapLayer, isMapReady, addMarkersToMap]);

  const locateUser = () => {
    if (!mapInstanceRef.current || !isMapReady) return;
    setIsLocating(true);
    mapInstanceRef.current.locate({ setView: true, maxZoom: 15 });
    mapInstanceRef.current.once('locationfound', (e: any) => {
      setUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      toast.success('Position trouvée !');
      setIsLocating(false);
    });
    mapInstanceRef.current.once('locationerror', () => {
      toast.error('Impossible de vous localiser');
      setIsLocating(false);
    });
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const centerOnUniversity = (uni: University) => {
    if (mapInstanceRef.current && uni.lat && uni.lng && isMapReady) {
      mapInstanceRef.current.setView([uni.lat, uni.lng], 14);
      setSelectedUniversity(uni);
    }
  };

  const continents = ['all', ...new Set(allUniversities.map(u => u.continent))];

  if (mapError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#0d0d35] to-[#0a0a2e] relative">
      <Navbar />

      {/* Background futuriste */}
      {mounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          {FIXED_POSITIONS.map((pos, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
              style={{
                left: pos.left,
                top: pos.top,
                animation: `float ${pos.duration}s ease-in-out infinite`,
                animationDelay: `${pos.delay}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="fixed top-16 left-0 right-0 z-30 pointer-events-none">
        <div className="container mx-auto px-4">
          <div className="pointer-events-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Atlas Universitaire
                </h1>
                <p className="text-slate-400 text-sm">
                  {filteredUniversities.length} universités répertoriées
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-black/50 backdrop-blur-xl rounded-xl border border-cyan-500/30 p-1 flex gap-1">
                  <button
                    onClick={() => setMapLayer('streets')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      mapLayer === 'streets' ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Map className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setMapLayer('satellite')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      mapLayer === 'satellite' ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Satellite className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setMapLayer('dark')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      mapLayer === 'dark' ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={locateUser}
                  disabled={isLocating}
                  className="p-2 bg-black/50 backdrop-blur-xl rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition"
                >
                  {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-black/50 backdrop-blur-xl rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal: Sidebar + Carte */}
      <div className="relative pt-32 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            {/* Sidebar - Liste des universités */}
            <motion.div
              initial={false}
              animate={{
                width: isSidebarCollapsed ? 'auto' : '400px',
                minWidth: isSidebarCollapsed ? 'auto' : '400px'
              }}
              transition={{ type: "spring", damping: 20 }}
              className="relative"
            >
              <div className="bg-black/80 backdrop-blur-2xl rounded-2xl border border-cyan-500/30 overflow-hidden flex flex-col shadow-2xl h-[calc(100vh-140px)]">
                {/* Header Sidebar */}
                <div className="p-4 border-b border-white/10 bg-black/50 backdrop-blur-sm flex-shrink-0">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-cyan-400" />
                      {!isSidebarCollapsed && `Universités (${filteredUniversities.length})`}
                    </h3>
                    <button
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {isSidebarCollapsed ? <ChevronRight className="h-4 w-4 text-cyan-400" /> : <ChevronLeft className="h-4 w-4 text-cyan-400" />}
                    </button>
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="space-y-3">
                      {/* Barre de recherche */}
                      <div className="relative">
                        <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-1 flex items-center">
                          <Search className="absolute left-3 h-4 w-4 text-cyan-400" />
                          <input
                            type="text"
                            placeholder="Rechercher une université..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-transparent text-white placeholder:text-slate-500 focus:outline-none rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Filtrer par continent</label>
                        <div className="flex flex-wrap gap-1">
                          {continents.map(continent => (
                            <button
                              key={continent}
                              onClick={() => setSelectedContinent(continent)}
                              className={cn(
                                "px-2 py-1 rounded-lg text-xs transition-all",
                                selectedContinent === continent
                                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                  : "bg-white/5 text-slate-400 hover:bg-white/10"
                              )}
                            >
                              {continent === 'all' ? '🌍 Tous' : continent}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Trier par</label>
                        <div className="flex gap-1">
                          {[
                            { value: 'ranking', label: '🏆 Classement' },
                            { value: 'students', label: '👥 Étudiants' },
                            { value: 'rating', label: '⭐ Note' }
                          ].map(option => (
                            <button
                              key={option.value}
                              onClick={() => setSortBy(option.value as any)}
                              className={cn(
                                "flex-1 px-2 py-1 rounded-lg text-xs transition-all flex items-center justify-center gap-1",
                                sortBy === option.value
                                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                  : "bg-white/5 text-slate-400 hover:bg-white/10"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Liste des universités - seulement visible quand non replié */}
                {!isSidebarCollapsed && (
                  <>
                    <div className="overflow-y-auto flex-1">
                      {filteredUniversities.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-slate-500 text-sm">Aucune université trouvée</div>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/10">
                          {filteredUniversities.map((uni, idx) => (
                            <motion.div
                              key={uni._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              onClick={() => centerOnUniversity(uni)}
                              onMouseEnter={() => setHoveredUniversity(uni._id)}
                              onMouseLeave={() => setHoveredUniversity(null)}
                              className={cn(
                                "p-4 cursor-pointer transition-all duration-300 relative overflow-hidden",
                                selectedUniversity?._id === uni._id
                                  ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-l-4 border-l-cyan-500"
                                  : "hover:bg-white/5",
                                hoveredUniversity === uni._id && "bg-white/5"
                              )}
                            >
                              <div className="flex items-start gap-3 relative z-10">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative",
                                  uni.ranking && uni.ranking <= 3
                                    ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                                    : "bg-gradient-to-br from-cyan-500 to-violet-600"
                                )}>
                                  {uni.ranking && uni.ranking <= 3 ? (
                                    <Trophy className="h-6 w-6 text-white" />
                                  ) : (
                                    <GraduationCap className="h-6 w-6 text-white" />
                                  )}
                                  {uni.ranking && uni.ranking <= 10 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                      #{uni.ranking}
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="font-semibold text-white text-sm truncate">{uni.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {uni.location}
                                        </span>
                                        <span className="text-xs text-cyan-400">{uni.country}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                      <span className="text-xs text-slate-300">{uni.rating?.toFixed(1)}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 mt-2 text-xs">
                                    <span className="text-slate-500 flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {uni.studentsCount?.toLocaleString()}
                                    </span>
                                    <span className="text-slate-500 flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />
                                      {uni.programsCount}
                                    </span>
                                  </div>

                                  {uni.email && (
                                    <div className="mt-1 text-xs text-slate-600 truncate">
                                      {uni.email}
                                    </div>
                                  )}
                                </div>

                                <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Sidebar */}
                    <div className="p-3 border-t border-white/10 bg-black/50 backdrop-blur-sm flex-shrink-0">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                          <span className="text-slate-400">{filteredUniversities.length} universités</span>
                        </div>
                        <div className="text-slate-500">
                          {filteredUniversities.reduce((sum, u) => sum + u.studentsCount, 0).toLocaleString()} étudiants
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Carte - prend tout l'espace restant */}
            <div className="flex-1 relative h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl">
              <div ref={mapRef} className="w-full h-full" />

              {(!mapLoaded || !isMapReady) && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Chargement de la carte...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panneau d'info université sélectionnée */}
      <AnimatePresence>
        {selectedUniversity && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-4 top-32 z-30 w-96 max-h-[calc(100vh-100px)] bg-black/80 backdrop-blur-2xl rounded-2xl border border-cyan-500/30 overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="relative h-32 bg-gradient-to-r from-cyan-600/30 to-violet-600/30">
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute -bottom-10 left-4">
                <div className={cn(
                  "w-20 h-20 rounded-xl flex items-center justify-center shadow-xl border-2 border-white/20",
                  selectedUniversity.ranking && selectedUniversity.ranking <= 3
                    ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                    : "bg-gradient-to-br from-cyan-500 to-violet-600"
                )}>
                  {selectedUniversity.ranking && selectedUniversity.ranking <= 3 ? (
                    <Trophy className="h-10 w-10 text-white" />
                  ) : (
                    <GraduationCap className="h-10 w-10 text-white" />
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedUniversity(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 pt-12">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{selectedUniversity.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3 text-cyan-400" />
                    <span className="text-sm text-slate-400">
                      {selectedUniversity.location}, {selectedUniversity.country}
                    </span>
                  </div>
                </div>
                {selectedUniversity.ranking && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">#{selectedUniversity.ranking}</div>
                    <div className="text-[10px] text-slate-500">Classement</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <Users className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{selectedUniversity.studentsCount?.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">Étudiants</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <BookOpen className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{selectedUniversity.programsCount}</p>
                  <p className="text-[10px] text-slate-500">Programmes</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <Award className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{selectedUniversity.partnerships || 0}</p>
                  <p className="text-[10px] text-slate-500">Partenariats</p>
                </div>
              </div>

              {selectedUniversity.email && (
                <div className="mt-3 p-2 rounded-xl bg-white/5">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm text-white truncate">{selectedUniversity.email}</p>
                </div>
              )}

              {selectedUniversity.phone && (
                <div className="mt-2 p-2 rounded-xl bg-white/5">
                  <p className="text-xs text-slate-400">Téléphone</p>
                  <p className="text-sm text-white">{selectedUniversity.phone}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => router.push(`/universities/${selectedUniversity._id}`)}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:shadow-lg transition"
                >
                  Voir détails
                </button>
                <button
                  onClick={() => centerOnUniversity(selectedUniversity)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
                >
                  Centrer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Légende */}
      <div className="fixed bottom-4 left-4 z-20 bg-black/50 backdrop-blur-xl rounded-xl border border-cyan-500/30 p-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-slate-400">Université</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-slate-400">Top 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-slate-400">Top 10</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .custom-marker {
          background: transparent;
          border: none;
        }

        .marker-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .marker-icon svg {
          color: white;
        }

        .marker-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(6, 182, 212, 0.4);
          border-radius: 50%;
          animation: pulse 1.5s ease-out infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }

        .custom-marker:hover .marker-icon {
          transform: scale(1.2);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.8);
        }

        .futuristic-popup .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 16px;
          color: white;
        }

        .futuristic-popup .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .custom-popup { min-width: 200px; }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .popup-header strong { color: #06b6d4; font-size: 14px; }
        .popup-country { font-size: 10px; color: #94a3b8; }

        .popup-stats {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: #cbd5e1;
          margin-bottom: 8px;
        }

        .popup-rating { font-size: 12px; color: #fbbf24; margin-bottom: 8px; }

        .popup-link {
          display: inline-block;
          font-size: 11px;
          color: #06b6d4;
          text-decoration: none;
        }

        .leaflet-control-zoom a {
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(6, 182, 212, 0.3) !important;
          color: #06b6d4 !important;
        }

        .leaflet-control-custom {
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(6, 182, 212, 0.3) !important;
        }

        .leaflet-control-custom:hover {
          background: rgba(6, 182, 212, 0.2) !important;
        }

        .overflow-y-auto::-webkit-scrollbar { width: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.8);
        }
      `}</style>
    </div>
  );
}