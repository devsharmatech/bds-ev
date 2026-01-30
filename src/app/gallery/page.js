"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Grid,
  ArrowLeft,
  Tag,
  Calendar,
  Share2,
  Heart,
  Play,
  Pause,
  RotateCw,
  ExternalLink,
  Sparkles,
  Layers,
  Eye,
  MoreVertical,
  Star,
  Image as ImageLucide,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [galleries, setGalleries] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeGallery, setActiveGallery] = useState(null);
  const [activeImages, setActiveImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [favoriteGalleries, setFavoriteGalleries] = useState(new Set());

  // Derived totals for hero/stats
  const totalPhotos = galleries.reduce((sum, g) => sum + (g.image_count || 0), 0);

  // Load galleries
  const loadGalleries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.success) setGalleries(data.galleries || []);
    } catch (error) {
      console.error("Failed to load galleries:", error);
      toast.error("Failed to load galleries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleries();
  }, []);

  // Open gallery viewer
  const openViewer = async (gallery) => {
    setActiveGallery(gallery);
    setActiveImages([]);
    setCurrentImageIndex(0);
    setViewerOpen(true);
    setZoomLevel(1);
    setLoadingImages(true);
    
    try {
      const res = await fetch(`/api/gallery/${gallery.id}`);
      const data = await res.json();
      if (data.success) {
        const images = (data.images || []).map((img) => ({
          url: img.image_url,
          id: img.id,
          alt: `${gallery.title} - Image ${img.id}`,
          uploaded_at: img.created_at,
        }));
        setActiveImages(images);
      }
    } catch (error) {
      console.error("Failed to load images:", error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoadingImages(false);
    }
  };

  // Navigation functions
  const nextImage = () => {
    if (activeImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
      setZoomLevel(1);
    }
  };

  const prevImage = () => {
    if (activeImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
      setZoomLevel(1);
    }
  };

  // Share function
  const shareGallery = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeGallery.title,
          text: `Check out this gallery: ${activeGallery.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Toggle favorite gallery
  const toggleFavoriteGallery = (galleryId, e) => {
    e.stopPropagation();
    const newFavorites = new Set(favoriteGalleries);
    if (newFavorites.has(galleryId)) {
      newFavorites.delete(galleryId);
      toast.success("Removed from favorites");
    } else {
      newFavorites.add(galleryId);
      toast.success("Added to favorites");
    }
    setFavoriteGalleries(newFavorites);
  };

  // Auto-play slideshow
  useEffect(() => {
    let interval;
    if (isPlaying && activeImages.length > 0) {
      interval = setInterval(() => {
        nextImage();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewerOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          setViewerOpen(false);
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'f':
        case 'F':
          setIsFullscreen(!isFullscreen);
          break;
        case '+':
        case '=':
          setZoomLevel(prev => Math.min(prev + 0.25, 3));
          break;
        case '-':
          setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerOpen, currentImageIndex, activeImages, activeGallery, isPlaying, isFullscreen]);

  // Format a gallery date into a readable string (Asia/Bahrain)
  const formatGalleryDate = (dateString) => {
    if (!dateString) return "Recently";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-BH", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Bahrain",
    });
  };

  // Modern Gallery Card Component
  const GalleryCard = ({ gallery }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
    >
      {/* Image Container with Gradient Overlay (no text on image) */}
      <div className="relative h-72 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
          {gallery.featured_image_url ? (
            <img
              src={gallery.featured_image_url}
              alt={gallery.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6">
              <ImageLucide className="w-16 h-16 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No preview available</p>
            </div>
          )}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium border border-white/30">
              {gallery.image_count || 0} photos
            </span>
            {gallery.tag1 && (
              <span className="px-3 py-1.5 bg-[#03215F]/20 backdrop-blur-sm text-white rounded-full text-xs font-medium border border-[#03215F]/30">
                {gallery.tag1}
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => toggleFavoriteGallery(gallery.id, e)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/30"
          >
            <Heart 
              className={`w-4 h-4 ${favoriteGalleries.has(gallery.id) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>
        
      </div>

      {/* Text content under the image */}
      <div className="p-5 bg-white">
        <div className="mb-3">
          <h3 className="font-bold text-lg mb-1 line-clamp-1 text-gray-900">{gallery.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {gallery.short_description || 'Explore the collection'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatGalleryDate(gallery.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Album
            </span>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#03215F]">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>
      
    </motion.div>
  );

  return (
    <MainLayout>
      <Toaster position="top-right" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#03215F] via-[#03215F] to-[#0a2f8a] text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.06)_75%,transparent_75%,transparent)] [background-size:20px_20px]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Visual Collection</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Events <span className="text-[#AE9B66]">Gallery</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl opacity-90 max-w-2xl"
            >
              Curated moments from our events, conferences, and community activities. Explore our visual story.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-8 mt-8 opacity-90"
            >
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-lg">
                <div className="p-2 rounded-lg bg-white/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{galleries.length}</div>
                  <div className="text-sm opacity-80">Collections</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-lg">
                <div className="p-2 rounded-lg bg-white/20">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalPhotos}</div>
                  <div className="text-sm opacity-80">Photos</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Gallery Viewer Slider */}
      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 bg-white ${isFullscreen ? '' : 'p-4 md:p-8'}`}
          >
            {/* Top Controls */}
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="absolute top-0 left-0 right-0 z-10 p-3 md:p-4 bg-white border-b border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewerOpen(false)}
                    className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 hover:scale-105"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="text-gray-900">
                    <h2 className="font-bold text-lg md:text-xl truncate max-w-md">
                      {activeGallery?.title}
                    </h2>
                    <div className="flex items-center gap-3 text-sm opacity-80 text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        {currentImageIndex + 1} of {activeImages.length}
                      </span>
                      {activeGallery?.tag1 && (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-xs border border-gray-200 text-gray-700">
                          {activeGallery.tag1}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Fullscreen Toggle */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 hover:scale-105"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => setViewerOpen(false)}
                    className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 hover:scale-105"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Main Image Display */}
            <div className="relative w-full h-full flex items-center justify-center pt-16 pb-24 md:pt-20 md:pb-28">
              {loadingImages ? (
                <div className="flex flex-col items-center justify-center gap-4 text-gray-700">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#03215F] rounded-full animate-spin"></div>
                    <Sparkles className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#03215F] animate-pulse" />
                  </div>
                  <p className="text-lg">Loading images...</p>
                </div>
              ) : activeImages.length === 0 ? (
                <div className="text-gray-700 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No images available</p>
                </div>
              ) : (
                <>
                  {/* Main Image */}
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="relative max-w-[90vw] max-h-[80vh]"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    <img
                      src={activeImages[currentImageIndex]?.url}
                      alt={activeImages[currentImageIndex]?.alt}
                      className="rounded-xl shadow-2xl max-w-full max-h-[80vh] object-contain"
                    />
                  </motion.div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 p-2.5 md:p-3.5 rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-100 transition-all duration-200 hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 p-2.5 md:p-3.5 rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-100 transition-all duration-200 hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Bottom Controls */}
                  <motion.div
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-transparent "
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      {/* Image Controls */}
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <button
                          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                          className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 hover:scale-105"
                          disabled={zoomLevel <= 0.5}
                        >
                          <ZoomOut className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => setZoomLevel(1)}
                          className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-200 hover:scale-105 text-sm font-medium"
                        >
                          {Math.round(zoomLevel * 100)}%
                        </button>
                        
                        <button
                          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                          className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 hover:scale-105"
                          disabled={zoomLevel >= 3}
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>

                        {/* Slideshow Toggle */}
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 hover:scale-105"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={shareGallery}
                          className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 hover:scale-105"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnails */}
                    {showThumbnails && activeImages.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 overflow-x-auto bg-white/90 backdrop-blur-sm rounded-xl p-2 border border-gray-200"
                      >
                        <div className="flex gap-2 pb-2">
                          {activeImages.map((img, idx) => (
                            <button
                              key={img.id || idx}
                              onClick={() => {
                                setCurrentImageIndex(idx);
                                setZoomLevel(1);
                              }}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                                idx === currentImageIndex
                                  ? 'ring-2 ring-[#03215F] scale-105 shadow-lg'
                                  : 'opacity-60 hover:opacity-100 hover:scale-105'
                              }`}
                            >
                              <img
                                src={img.url}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gallery Content */}
      <div className="min-h-[calc(80vh-100px)] py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Collections
              </h2>
              <p className="text-gray-600">
                Browse through our curated visual stories
              </p>
            </div>
            
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-4">
                <div className="w-12 h-12 border-3 border-[#03215F]/20 border-t-[#03215F] rounded-full animate-spin"></div>
                <Sparkles className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#03215F] animate-pulse" />
              </div>
              <p className="text-gray-600">Loading galleries...</p>
            </div>
          ) : galleries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-40 h-40 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                <ImageIcon className="w-20 h-20 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Galleries Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                We're preparing amazing visual content for you. Check back soon!
              </p>
              <Link href="/" className="px-6 py-3 bg-[#03215F] text-white rounded-lg hover:bg-[#031a4a] transition-colors font-medium">
                Subscribe for Updates
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
              {galleries.map((gallery) => (
                <div
                  key={gallery.id}
                  onClick={() => openViewer(gallery)}
                  className="focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:ring-offset-2 rounded-2xl transition-transform duration-200 hover:-translate-y-1"
                >
                  <GalleryCard gallery={gallery} />
                </div>
              ))}
            </div>
          )}

          {/* Stats Footer */}
          {galleries.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-20 pt-12 border-t border-gray-200"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-[#03215F]">{galleries.length}</div>
                  <div className="text-gray-600 text-sm uppercase tracking-wider font-medium mt-1">Collections</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-[#AE9B66]">{totalPhotos}</div>
                  <div className="text-gray-600 text-sm uppercase tracking-wider font-medium mt-1">Total Photos</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-[#9cc2ed]">
                    {Math.max(...galleries.map(g => g.image_count || 0))}
                  </div>
                  <div className="text-gray-600 text-sm uppercase tracking-wider font-medium mt-1">Largest Collection</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-[#ECCF0F]">
                    {Math.round(galleries.reduce((sum, g) => sum + (g.image_count || 0), 0) / galleries.length)}
                  </div>
                  <div className="text-gray-600 text-sm uppercase tracking-wider font-medium mt-1">Avg. Photos</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}