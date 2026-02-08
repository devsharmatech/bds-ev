"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Image as ImageIcon,
  Upload,
  Save,
  Loader2,
  Eye,
  Link as LinkIcon,
  RefreshCw,
  Check,
  X,
  Play,
  Pause,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function HeroSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    video_url: '',
    poster_url: '',
  });
  
  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [posterUrlInput, setPosterUrlInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [removePoster, setRemovePoster] = useState(false);
  
  const videoRef = useRef(null);
  const videoInputRef = useRef(null);
  const posterInputRef = useRef(null);

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero-settings');
      const data = await res.json();
      
      if (data.success) {
        setSettings({
          video_url: data.settings.hero_video_url || '',
          poster_url: data.settings.hero_poster_url || '',
        });
        setVideoUrlInput(data.settings.hero_video_url || '');
        setPosterUrlInput(data.settings.hero_poster_url || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle video file selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('Video file is too large. Maximum size is 100MB');
        return;
      }
      setVideoFile(file);
      setRemoveVideo(false);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  // Handle poster file selection
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image file is too large. Maximum size is 5MB');
        return;
      }
      setPosterFile(file);
      setRemovePoster(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle video play/pause
  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving hero settings...');
    
    try {
      const formData = new FormData();
      
      if (useUrlInput) {
        if (videoUrlInput) formData.append('video_url', videoUrlInput);
        if (posterUrlInput) formData.append('poster_url', posterUrlInput);
      } else {
        if (videoFile) formData.append('video', videoFile);
        if (posterFile) formData.append('poster', posterFile);
      }
      if (removeVideo) formData.append('remove_video', 'true');
      if (removePoster) formData.append('remove_poster', 'true');

      const res = await fetch('/api/admin/hero-settings/update', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Hero settings updated successfully!', { id: toastId });
        setSettings({
          video_url: data.settings.hero_video_url,
          poster_url: data.settings.hero_poster_url,
        });
        // Clear file inputs
        setVideoFile(null);
        setPosterFile(null);
        setVideoPreview(null);
        setPosterPreview(null);
        setRemoveVideo(false);
        setRemovePoster(false);
      } else {
        toast.error(data.error || 'Failed to save settings', { id: toastId });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Network error. Please try again.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setVideoFile(null);
    setPosterFile(null);
    setVideoPreview(null);
    setPosterPreview(null);
    setVideoUrlInput(settings.video_url);
    setPosterUrlInput(settings.poster_url);
    setRemoveVideo(false);
    setRemovePoster(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading hero settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Section Settings</h1>
          <p className="text-gray-600 mt-1">Manage the background video and poster for the homepage hero section</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!videoFile && !posterFile && !useUrlInput && !removeVideo && !removePoster)}
            className="px-6 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Input Type Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-700">Input Method:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUseUrlInput(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !useUrlInput
                  ? 'bg-white text-[#03215F] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              File Upload
            </button>
            <button
              onClick={() => setUseUrlInput(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                useUrlInput
                  ? 'bg-white text-[#03215F] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              URL Input
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Video Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#03215F]/10 rounded-lg">
                <Video className="w-5 h-5 text-[#03215F]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Background Video</h3>
                <p className="text-xs text-gray-500">MP4 format recommended, max 100MB</p>
              </div>
            </div>

            {/* Current Video Preview */}
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
              {videoPreview || settings.video_url ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoPreview || settings.video_url}
                    poster={posterPreview || settings.poster_url || undefined}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button
                      onClick={toggleVideoPlay}
                      className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </button>
                  </div>
                  {videoPreview && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      New Video Selected
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No video selected
                </div>
              )}
            </div>

            {useUrlInput ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                />
              </div>
            ) : (
              <div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#03215F] hover:bg-[#03215F]/5 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    {videoFile ? videoFile.name : 'Click to upload video'}
                  </span>
                </button>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{removeVideo ? 'Video will be removed when you save.' : ''}</span>
              <button
                type="button"
                onClick={() => {
                  setRemoveVideo(true);
                  setVideoFile(null);
                  setVideoPreview(null);
                  setVideoUrlInput('');
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50"
              >
                <X className="w-3 h-3" />
                Remove Video
              </button>
            </div>
          </div>

          {/* Poster Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#AE9B66]/10 rounded-lg">
                <ImageIcon className="w-5 h-5 text-[#AE9B66]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Video Poster</h3>
                <p className="text-xs text-gray-500">Shown before video loads, max 5MB</p>
              </div>
            </div>

            {/* Current Poster Preview */}
            <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
              {posterPreview || settings.poster_url ? (
                <>
                  <img
                    src={posterPreview || settings.poster_url}
                    alt="Video poster"
                    className="w-full h-full object-cover"
                  />
                  {posterPreview && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      New Poster Selected
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No poster selected
                </div>
              )}
            </div>

            {useUrlInput ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poster URL
                </label>
                <input
                  type="url"
                  value={posterUrlInput}
                  onChange={(e) => setPosterUrlInput(e.target.value)}
                  placeholder="https://example.com/poster.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                />
              </div>
            ) : (
              <div>
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="hidden"
                />
                <button
                  onClick={() => posterInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#AE9B66] hover:bg-[#AE9B66]/5 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    {posterFile ? posterFile.name : 'Click to upload poster'}
                  </span>
                </button>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{removePoster ? 'Poster will be removed when you save.' : ''}</span>
              <button
                type="button"
                onClick={() => {
                  setRemovePoster(true);
                  setPosterFile(null);
                  setPosterPreview(null);
                  setPosterUrlInput('');
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50"
              >
                <X className="w-3 h-3" />
                Remove Poster
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Settings Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Current Settings</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Video className="w-5 h-5 text-[#03215F] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Video URL</p>
              <p className="text-sm text-gray-500 truncate">{settings.video_url || 'Not set'}</p>
            </div>
            {settings.video_url && (
              <a
                href={settings.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4 text-gray-500" />
              </a>
            )}
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <ImageIcon className="w-5 h-5 text-[#AE9B66] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Poster URL</p>
              <p className="text-sm text-gray-500 truncate">{settings.poster_url || 'Not set'}</p>
            </div>
            {settings.poster_url && (
              <a
                href={settings.poster_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4 text-gray-500" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Tips for best results</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-blue-600" />
            <span>Use MP4 format for best browser compatibility</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-blue-600" />
            <span>Keep video file size under 50MB for faster loading</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-blue-600" />
            <span>Recommended video resolution: 1920x1080 or higher</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-blue-600" />
            <span>Poster image should match video dimensions</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-blue-600" />
            <span>Choose a poster that represents the video well</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
