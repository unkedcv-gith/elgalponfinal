import React, { useRef, useState, useEffect } from 'react';
import {
  MapPin,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Images,
  Film,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X
} from 'lucide-react';
import calle5Video from '../assets/videos/calle5.mp4';

// Import Calle 5 Photos
import calle5_01 from '../assets/images/calle5/calle5_01.jpg';
import calle5_02 from '../assets/images/calle5/calle5_02.jpeg';
import calle5_03 from '../assets/images/calle5/calle5_03.jpeg';
import calle5_04 from '../assets/images/calle5/calle5_04.jpeg';
import calle5_05 from '../assets/images/calle5/calle5_05.jpeg';
import calle5_06 from '../assets/images/calle5/calle5_06.jpeg';

// Import Calle 13 Photos
import calle13_01 from '../assets/images/calle13/calle13_01.jpg';
import calle13_02 from '../assets/images/calle13/calle13_02.jpg';
import calle13_03 from '../assets/images/calle13/calle13_03.jpg';

// Import Calle 13 Videos
import calle13_04 from '../assets/images/calle13/calle13_04.mp4';
import calle13_05 from '../assets/images/calle13/calle13_05.mp4';
import calle13_06 from '../assets/images/calle13/calle13_06.mp4';

export interface GalleryPhoto {
  id: string;
  src: string;
  title: string;
  subtitle: string;
}

export interface VideoItem {
  id: string;
  src: string;
  title: string;
  label?: string;
  subtitle?: string;
}

const CALLE_5_GALLERY: GalleryPhoto[] = [
  {
    id: 'c5_1',
    src: calle5_01,
    title: 'Circuito de Juegos y Dinámicas',
    subtitle: 'Actividades recreativas coordinadas por profesores en el salón principal',
  },
  {
    id: 'c5_2',
    src: calle5_02,
    title: 'Rincón de Torta & Feliz Cumple',
    subtitle: 'Sector temático del agasajado con cartel luminoso y mesas especiales',
  },
  {
    id: 'c5_3',
    src: calle5_03,
    title: 'Área de Mesas y Cafetería',
    subtitle: 'Comedor amplio con bancos nórdicos para familias y adultos',
  },
  {
    id: 'c5_4',
    src: calle5_04,
    title: 'Comedor Equipado y Wi-Fi',
    subtitle: 'Espacio climatizado con excelente iluminación y comodidad',
  },
  {
    id: 'c5_5',
    src: calle5_05,
    title: 'Muro de Escalada, Telas & Cancha',
    subtitle: 'Vista panorámica del sector deportivo, tirolesa y luces de fiesta',
  },
  {
    id: 'c5_6',
    src: calle5_06,
    title: 'Plaza Blanda & Pelotero para Pekes',
    subtitle: 'Sector exclusivo con piso antigolpes, tobogán, pelotas y caballitos',
  },
];

const CALLE_13_GALLERY: GalleryPhoto[] = [
  {
    id: 'c13_1',
    src: calle13_01,
    title: 'Salón Principal y Atracciones',
    subtitle: 'Instalaciones deportivas y juegos dinámicos para todas las edades',
  },
  {
    id: 'c13_2',
    src: calle13_02,
    title: 'Sector Social y Comedor',
    subtitle: 'Ambiente confortable para meriendas, cumples y eventos',
  },
  {
    id: 'c13_3',
    src: calle13_03,
    title: 'Área de Juegos y Diversión',
    subtitle: 'Espacio seguro y alegre con animación profesional',
  },
];

const CALLE_13_VIDEOS: VideoItem[] = [
  {
    id: 'c13_v4',
    src: calle13_04,
    title: 'Atracciones & Juegos',
    label: 'Clip 1',
    subtitle: 'Circuito de destreza y juegos en Calle 13',
  },
  {
    id: 'c13_v5',
    src: calle13_05,
    title: 'Diversión & Inflables',
    label: 'Clip 2',
    subtitle: 'Salón ambientado con juegos e inflables',
  },
  {
    id: 'c13_v6',
    src: calle13_06,
    title: 'Espacio Recreativo',
    label: 'Clip 3',
    subtitle: 'Animación y actividades para los chicos',
  },
];

interface BranchCardProps {
  title: string;
  address: string;
  videoSrc?: string;
  videos?: VideoItem[];
  tag: string;
  tagColor: string;
  borderColor: string;
  accentColor: string;
  galleryPhotos: GalleryPhoto[];
  defaultView?: 'video' | 'gallery';
}

const BranchCard: React.FC<BranchCardProps> = ({
  title,
  address,
  videoSrc,
  videos,
  tag,
  tagColor,
  borderColor,
  accentColor,
  galleryPhotos,
  defaultView = 'gallery',
}) => {
  const [currentView, setCurrentView] = useState<'video' | 'gallery'>(defaultView);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Video playlist
  const videoList: VideoItem[] = videos && videos.length > 0 
    ? videos 
    : videoSrc 
      ? [{ id: 'main', src: videoSrc, title: `Video de ${title}`, label: 'Video' }]
      : [];

  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
  const currentVideo = videoList[activeVideoIdx] || videoList[0];

  // Video state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Reload and play when active video changes
  useEffect(() => {
    if (videoRef.current && currentView === 'video') {
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [activeVideoIdx, currentView]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handlePrevVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVideoIdx((prev) => (prev === 0 ? videoList.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleNextVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVideoIdx((prev) => (prev === videoList.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
  };

  const handleVideoEnded = () => {
    if (videoList.length > 1) {
      setActiveVideoIdx((prev) => (prev + 1) % videoList.length);
      setIsPlaying(true);
    }
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIdx((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActivePhotoIdx((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, galleryPhotos.length]);

  const currentPhoto = galleryPhotos[activePhotoIdx] || galleryPhotos[0];

  return (
    <>
      <div className={`group relative bg-black/85 rounded-3xl border-2 ${borderColor} overflow-hidden shadow-2xl flex flex-col transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)]`}>
        
        {/* Top Header Badge & Tab Switcher */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-zinc-950/95 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${tagColor}`}>
                {tag}
              </span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-zinc-300 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#F2C700] shrink-0" />
              <span>{address}</span>
            </p>
          </div>

          {/* View Switcher: Gallery vs Video */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <div className="inline-flex items-center bg-black/70 p-1 rounded-2xl border border-white/15 shadow-inner">
              <button
                type="button"
                onClick={() => setCurrentView('gallery')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                  currentView === 'gallery'
                    ? 'bg-gradient-to-r from-[#ED3078] to-[#1EB8BF] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Images className="w-3.5 h-3.5" />
                <span>Fotos ({galleryPhotos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('video');
                  if (videoRef.current && videoRef.current.paused) {
                    videoRef.current.play().catch(() => {});
                    setIsPlaying(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                  currentView === 'video'
                    ? 'bg-zinc-800 text-white shadow-md border border-white/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Videos {videoList.length > 1 ? `(${videoList.length})` : ''}</span>
              </button>
            </div>

            {/* Mute button (only active when video view) */}
            {currentView === 'video' && (
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-white transition-all cursor-pointer shadow-md hover:scale-105"
                title={isMuted ? 'Activar Sonido' : 'Silenciar'}
                aria-label={isMuted ? 'Activar Sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-[#F2C700]" />}
              </button>
            )}
          </div>
        </div>

        {/* Media Viewport */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-zinc-950 overflow-hidden select-none">
          {currentView === 'gallery' ? (
            /* Gallery Active Photo View */
            <div 
              className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer group/viewport"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={currentPhoto.src}
                alt={currentPhoto.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/viewport:scale-[1.02]"
              />

              {/* Top Bar inside Viewport: Photo counter & expand button */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-heading font-black text-white border border-white/20 shadow-lg tracking-wider">
                  Foto {activePhotoIdx + 1} de {galleryPhotos.length}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="pointer-events-auto p-2 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 shadow-lg hover:scale-110 transition-all cursor-pointer"
                  title="Ver en pantalla completa"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Prev / Next arrows */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#ED3078] text-white border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-xs transition-all hover:scale-110 cursor-pointer z-10"
                title="Foto anterior"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#1EB8BF] text-white border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-xs transition-all hover:scale-110 cursor-pointer z-10"
                title="Foto siguiente"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Bottom Caption Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end text-left pointer-events-none">
                <h4 className="font-heading font-black text-white text-sm sm:text-base tracking-wide drop-shadow-md">
                  {currentPhoto.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-300 font-medium drop-shadow-sm line-clamp-1">
                  {currentPhoto.subtitle}
                </p>
              </div>
            </div>
          ) : (
            /* Video View */
            <div 
              className="relative w-full h-full bg-zinc-950 cursor-pointer overflow-hidden group/video"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={currentVideo?.src}
                autoPlay
                loop={videoList.length === 1}
                muted={isMuted}
                playsInline
                onEnded={handleVideoEnded}
                className="w-full h-full object-cover object-center"
              />

              {/* Video Info Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                {videoList.length > 1 && (
                  <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-heading font-black text-white border border-[#1EB8BF]/40 shadow-lg tracking-wider flex items-center gap-1.5">
                    <Film className="w-3 h-3 text-[#1EB8BF]" />
                    <span>{currentVideo.label || `Video ${activeVideoIdx + 1}`}: {currentVideo.title}</span>
                  </span>
                )}
              </div>

              {/* Prev / Next video arrows if multiple videos */}
              {videoList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevVideo}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#1EB8BF] text-white border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-xs transition-all hover:scale-110 cursor-pointer z-10 opacity-80 hover:opacity-100"
                    title="Video anterior"
                    aria-label="Video anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextVideo}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#1EB8BF] text-white border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-xs transition-all hover:scale-110 cursor-pointer z-10 opacity-80 hover:opacity-100"
                    title="Video siguiente"
                    aria-label="Video siguiente"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Play / Pause Overlay on Hover/Paused */}
              <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${isPlaying ? 'opacity-0 group-hover/video:opacity-100' : 'opacity-100 bg-black/50'}`}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/80 border-2 border-white/80 text-white flex items-center justify-center shadow-xl backdrop-blur-xs transition-transform hover:scale-110">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                </div>
              </div>

              {/* Overlay prompt to switch to gallery */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView('gallery');
                  }}
                  className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-[#ED3078] border border-white/20 text-white text-xs font-heading font-black uppercase tracking-wider transition-all shadow-lg backdrop-blur-sm cursor-pointer"
                >
                  <Images className="w-3.5 h-3.5 text-[#F2C700]" />
                  <span>Ver {galleryPhotos.length} fotos de la sede</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Clips Playlist Bar (when in video mode and multiple videos available) */}
        {currentView === 'video' && videoList.length > 1 && (
          <div className="p-3 bg-zinc-950/95 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-heading font-black uppercase text-zinc-400 px-1 shrink-0 flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-[#1EB8BF]" /> Clips:
            </span>
            {videoList.map((v, idx) => {
              const isActive = activeVideoIdx === idx;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setActiveVideoIdx(idx);
                    setIsPlaying(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#1EB8BF] text-black shadow-md shadow-[#1EB8BF]/30 scale-105'
                      : 'bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20 border border-white/10'
                  }`}
                  title={v.title}
                >
                  <Play className={`w-3 h-3 ${isActive ? 'fill-black' : 'fill-zinc-300'}`} />
                  <span>{v.label || `Clip ${idx + 1}`}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Thumbnail Carousel Bar (when in gallery mode) */}
        {currentView === 'gallery' && (
          <div className="p-3 bg-zinc-950/95 border-t border-white/10 flex items-center gap-2.5 overflow-x-auto scrollbar-none">
            {galleryPhotos.map((photo, idx) => {
              const isSelected = activePhotoIdx === idx;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => {
                    setActivePhotoIdx(idx);
                  }}
                  className={`relative shrink-0 w-14 h-11 sm:w-16 sm:h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? `${accentColor} scale-105 shadow-lg ring-2 ring-white/40`
                      : 'border-white/15 opacity-60 hover:opacity-100 hover:border-white/50'
                  }`}
                  title={photo.title}
                  aria-label={`Ver foto ${idx + 1}: ${photo.title}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-0.5 right-1 text-[9px] font-black text-white bg-black/70 px-1 rounded-sm">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Top Header */}
          <div 
            className="flex items-center justify-between text-white border-b border-white/10 pb-3 z-10 max-w-6xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tagColor}`}>
                  {tag}
                </span>
                <span className="text-xs text-zinc-400 font-bold">
                  Foto {activePhotoIdx + 1} de {galleryPhotos.length}
                </span>
              </div>
              <h3 className="font-heading font-black text-base sm:text-xl text-white uppercase tracking-wide">
                {currentPhoto.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-[#ED3078] text-white transition-all cursor-pointer border border-white/20 hover:scale-105"
              title="Cerrar (Esc)"
              aria-label="Cerrar galería"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Center Image Viewport */}
          <div 
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden max-w-6xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-black/75 hover:bg-[#ED3078] text-white border border-white/30 flex items-center justify-center shadow-2xl transition-all hover:scale-110 cursor-pointer"
              title="Foto anterior (←)"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Active Image */}
            <img
              src={currentPhoto.src}
              alt={currentPhoto.title}
              className="max-h-[72vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl border border-white/10 select-none animate-in zoom-in-95 duration-200"
            />

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-black/75 hover:bg-[#1EB8BF] text-white border border-white/30 flex items-center justify-center shadow-2xl transition-all hover:scale-110 cursor-pointer"
              title="Foto siguiente (→)"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* Lightbox Bottom Footer / Thumbnails */}
          <div 
            className="max-w-6xl w-full mx-auto space-y-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-xs sm:text-sm text-zinc-300 font-medium max-w-2xl mx-auto">
              {currentPhoto.subtitle}
            </p>

            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {galleryPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative shrink-0 w-14 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activePhotoIdx === idx
                      ? 'border-[#ED3078] scale-105 shadow-lg ring-2 ring-white/50'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                  }`}
                  title={photo.title}
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-white bg-black/75 px-1 rounded-sm">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const BranchVideosSection: React.FC = () => {
  return (
    <section id="sucursales-videos" className="w-full bg-gradient-to-b from-[#1EB8BF] via-black to-[#1EB8BF] py-12 sm:py-16 text-white transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            Conocé <span className="text-[#F2C700]">El Galpón</span>
          </h2>
          <p className="text-zinc-200 text-sm sm:text-base font-medium leading-relaxed">
            Descubrí los espacios, atracciones y toda la energía de nuestras dos sedes preparadas para que cada momento sea inolvidable.
          </p>
        </div>

        {/* 2-Column Branch Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* El Galpón Calle 5 with full 6-image photo gallery */}
          <BranchCard
            title="El Galpón Calle 5"
            address="Calle 5 e/ 34 y 35 • La Plata"
            videoSrc={calle5Video}
            tag="Sede Calle 5"
            tagColor="bg-[#ED3078] text-white"
            borderColor="border-[#ED3078]/60 hover:border-[#ED3078]"
            accentColor="border-[#ED3078] shadow-[#ED3078]/40"
            galleryPhotos={CALLE_5_GALLERY}
            defaultView="gallery"
          />

          {/* El Galpón Calle 13 with multiple video clips and gallery */}
          <BranchCard
            title="El Galpón Calle 13"
            address="Calle 13 e/ 530 y 531 • La Plata"
            videos={CALLE_13_VIDEOS}
            tag="Sede Calle 13"
            tagColor="bg-[#1EB8BF] text-black font-black"
            borderColor="border-[#1EB8BF]/60 hover:border-[#1EB8BF]"
            accentColor="border-[#1EB8BF] shadow-[#1EB8BF]/40"
            galleryPhotos={CALLE_13_GALLERY}
            defaultView="video"
          />

        </div>
      </div>
    </section>
  );
};
