"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
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
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import toast, { Toaster } from "react-hot-toast";

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
  const [favoriteImages, setFavoriteImages] = useState(new Set());

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

  // Download functions
  const downloadImage = async (imageUrl, imageName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName || `gallery-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image");
    }
  };

  const downloadAllImages = async () => {
    if (activeImages.length === 0) return;
    
    toast.loading(`Downloading ${activeImages.length} images...`);
    
    for (let i = 0; i < activeImages.length; i++) {
      const image = activeImages[i];
      try {
        await downloadImage(image.url, `${activeGallery.title}-${i + 1}.jpg`);
      } catch (error) {
        console.error(`Failed to download image ${i + 1}:`, error);
      }
    }
    
    toast.dismiss();
    toast.success("All images downloaded!");
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

  // Toggle favorite
  const toggleFavorite = (imageId) => {
    const newFavorites = new Set(favoriteImages);
    if (newFavorites.has(imageId)) {
      newFavorites.delete(imageId);
      toast.success("Removed from favorites");
    } else {
      newFavorites.add(imageId);
      toast.success("Added to favorites");
    }
    setFavoriteImages(newFavorites);
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
        case 'd':
        case 'D':
          if (activeImages[currentImageIndex]) {
            downloadImage(activeImages[currentImageIndex].url, `${activeGallery.title}-${currentImageIndex + 1}.jpg`);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerOpen, currentImageIndex, activeImages, activeGallery, isPlaying, isFullscreen]);

  // Gallery Card Component
  const GalleryCard = ({ gallery }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Image Container with Fixed Height */}
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {gallery.featured_image_url ? (
          <img
            src={gallery.featured_image_url}
            alt={gallery.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No image</p>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-bold text-lg mb-1">{gallery.title}</h3>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="text-sm opacity-90">
                {gallery.image_count || 0} images
              </span>
            </div>
          </div>
        </div>
        
        {/* View Button */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white select-none">
            View Gallery
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {gallery.tag1 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
              <Tag className="w-3 h-3" />
              {gallery.tag1}
            </span>
          )}
          {gallery.tag2 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F] border border-[#9cc2ed]">
              <Tag className="w-3 h-3" />
              {gallery.tag2}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <MainLayout>
      <Toaster position="top-right" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <ImageIcon className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Gallery</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Photo Gallery</h1>
            <p className="text-lg md:text-xl opacity-90">
              Explore moments from our events, conferences, and community activities.
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-6 opacity-90">
              <div className="flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                <span>{galleries.length} Galleries</span>
              </div>
              <div className="flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                <span>{totalPhotos} Photos</span>
              </div>
            </div>
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
            className={`fixed inset-0 z-50 bg-black ${
              isFullscreen ? '' : 'p-4 md:p-8'
            }`}
          >
            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewerOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="text-white">
                    <h2 className="font-bold text-lg truncate">{activeGallery?.title}</h2>
                    <div className="flex items-center gap-3 text-sm opacity-80">
                      <span>{currentImageIndex + 1} of {activeImages.length}</span>
                      {activeGallery?.tag1 && (
                        <span className="px-2 py-1 rounded-full bg-white/10 text-xs">
                          {activeGallery.tag1}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Download All */}
                  {activeImages.length > 0 && (
                    <button
                      onClick={downloadAllImages}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#03215F] to-[#03215F] text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden md:inline">Download All</span>
                    </button>
                  )}
                  
                  {/* Fullscreen Toggle */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => setViewerOpen(false)}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Image Display */}
            <div className="relative w-full h-full flex items-center justify-center">
              {loadingImages ? (
                <div className="flex flex-col items-center justify-center gap-4 text-white">
                  <Clock className="w-12 h-12 animate-pulse" />
                  <p>Loading images...</p>
                </div>
              ) : activeImages.length === 0 ? (
                <div className="text-white text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No images available</p>
                </div>
              ) : (
                <>
                  {/* Main Image */}
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="relative max-w-[90vw] max-h-[80vh]"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    <img
                      src={activeImages[currentImageIndex]?.url}
                      alt={activeImages[currentImageIndex]?.alt}
                      className="rounded-lg shadow-2xl max-w-full max-h-[80vh] object-contain"
                    />
                  </motion.div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Bottom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      {/* Image Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                          disabled={zoomLevel <= 0.5}
                        >
                          <ZoomOut className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => setZoomLevel(1)}
                          className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors text-sm"
                        >
                          {Math.round(zoomLevel * 100)}%
                        </button>
                        
                        <button
                          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                          disabled={zoomLevel >= 3}
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>

                        {/* Slideshow Toggle */}
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>

                        {/* Favorite */}
                        <button
                          onClick={() => toggleFavorite(activeImages[currentImageIndex]?.id)}
                          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                        >
                          <Heart className={`w-5 h-5 ${
                            favoriteImages.has(activeImages[currentImageIndex]?.id) 
                              ? 'fill-red-500 text-red-500' 
                              : ''
                          }`} />
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={shareGallery}
                          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => downloadImage(
                            activeImages[currentImageIndex]?.url,
                            `${activeGallery.title}-${currentImageIndex + 1}.jpg`
                          )}
                          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnails */}
                    {showThumbnails && activeImages.length > 1 && (
                      <div className="mt-4 overflow-x-auto">
                        <div className="flex gap-2 pb-2">
                          {activeImages.map((img, idx) => (
                            <button
                              key={img.id || idx}
                              onClick={() => {
                                setCurrentImageIndex(idx);
                                setZoomLevel(1);
                              }}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                idx === currentImageIndex
                                  ? 'border-white shadow-lg scale-105'
                                  : 'border-transparent hover:border-white/50'
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
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gallery Content */}
      <div className="min-h-[calc(80vh-100px)] py-8 md:py-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          {/* Gallery Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Clock className="w-12 h-12 text-[#03215F] animate-pulse mb-4" />
              <p className="text-gray-600">Loading galleries...</p>
            </div>
          ) : galleries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Galleries Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Check back soon for photos from our upcoming events and activities.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {galleries.map((gallery) => (
                <button
                  key={gallery.id}
                  onClick={() => openViewer(gallery)}
                  className="focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:ring-offset-2 rounded-2xl"
                >
                  <GalleryCard gallery={gallery} />
                </button>
              ))}
            </div>
          )}

          {/* Stats Footer */}
          {galleries.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 pt-8 border-t border-gray-200"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-3xl font-bold text-[#03215F]">{galleries.length}</div>
                  <div className="text-gray-600">Galleries</div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-3xl font-bold text-[#AE9B66]">
                    {galleries.reduce((sum, g) => sum + (g.image_count || 0), 0)}
                  </div>
                  <div className="text-gray-600">Total Photos</div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-3xl font-bold text-[#9cc2ed]">
                    {Math.max(...galleries.map(g => g.image_count || 0))}
                  </div>
                  <div className="text-gray-600">Largest Gallery</div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-3xl font-bold text-[#ECCF0F]">
                    {Math.round(galleries.reduce((sum, g) => sum + (g.image_count || 0), 0) / galleries.length)}
                  </div>
                  <div className="text-gray-600">Avg. per Gallery</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}