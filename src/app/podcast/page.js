"use client";

import { 
  Mic, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Calendar,
  Clock,
  Download,
  Share2,
  Headphones,
  Users,
  MessageCircle,
  ExternalLink
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useState, useRef, useEffect } from "react";

export default function PodcastPage() {
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  
  const audioRef = useRef(null);

  const episodes = [
    {
      id: 1,
      title: "The Future of Digital Dentistry in Bahrain",
      description: "Exploring how digital technologies are transforming dental practice in Bahrain, featuring interviews with leading digital dentistry experts.",
      date: "March 15, 2024",
      duration: "45:22",
      guests: ["Dr. Ahmed Al Khalifa", "Dr. Sarah Johnson"],
      topics: ["Digital Dentistry", "Technology", "Innovation"],
      plays: 1245,
      likes: 89,
      audioUrl: "/podcast/episode-1.mp3"
    },
    {
      id: 2,
      title: "Oral Health Awareness: Community Initiatives",
      description: "Discussion on BDS community programs and their impact on public oral health in Bahrain.",
      date: "March 8, 2024",
      duration: "38:15",
      guests: ["Dr. Noor Al Hashimi", "Dr. Fatima Al Jishi"],
      topics: ["Community Health", "Public Awareness", "Outreach"],
      plays: 987,
      likes: 76,
      audioUrl: "/podcast/episode-2.mp3"
    },
    {
      id: 3,
      title: "Advancements in Dental Education",
      description: "How dental education is evolving in Bahrain and the role of continuous professional development.",
      date: "March 1, 2024",
      duration: "52:10",
      guests: ["Dr. Sara Mohammed", "Prof. David Miller"],
      topics: ["Education", "CPD", "Professional Development"],
      plays: 1123,
      likes: 94,
      audioUrl: "/podcast/episode-3.mp3"
    },
    {
      id: 4,
      title: "Dental Ethics in Modern Practice",
      description: "Navigating ethical challenges in contemporary dental practice with expert insights.",
      date: "February 23, 2024",
      duration: "41:35",
      guests: ["Dr. Mohammed Al Ansari", "Dr. Layla Al Mansoori"],
      topics: ["Ethics", "Professional Standards", "Practice Management"],
      plays: 856,
      likes: 68,
      audioUrl: "/podcast/episode-4.mp3"
    },
    {
      id: 5,
      title: "Pediatric Dentistry: Challenges & Solutions",
      description: "Specialized discussion on children's dental care and behavior management techniques.",
      date: "February 16, 2024",
      duration: "47:50",
      guests: ["Dr. James Wilson", "Dr. Aisha Al-Khalifa"],
      topics: ["Pediatric Dentistry", "Children's Health", "Behavior Management"],
      plays: 1034,
      likes: 82,
      audioUrl: "/podcast/episode-5.mp3"
    },
    {
      id: 6,
      title: "Dental Research in Bahrain: Current Landscape",
      description: "Overview of dental research activities and opportunities in Bahrain.",
      date: "February 9, 2024",
      duration: "49:25",
      guests: ["Dr. Omar Rashid", "Dr. Robert Kim"],
      topics: ["Research", "Scientific Advancement", "Innovation"],
      plays: 765,
      likes: 61,
      audioUrl: "/podcast/episode-6.mp3"
    }
  ];

  const podcastPlatforms = [
    { name: "Apple Podcasts", icon: "🍏", url: "#" },
    { name: "Spotify", icon: "🎵", url: "#" },
    { name: "Google Podcasts", icon: "🔊", url: "#" },
    { name: "Amazon Music", icon: "▶️", url: "#" },
    { name: "YouTube", icon: "📺", url: "#" },
    { name: "RSS Feed", icon: "📡", url: "#" }
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const playEpisode = (index) => {
    setCurrentEpisode(index);
    setIsPlaying(true);
    // In a real implementation, this would load the actual audio file
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 100);
  };

  const handleNext = () => {
    const nextEpisode = (currentEpisode + 1) % episodes.length;
    playEpisode(nextEpisode);
  };

  const handlePrevious = () => {
    const prevEpisode = (currentEpisode - 1 + episodes.length) % episodes.length;
    playEpisode(prevEpisode);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Mic className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">BDS Podcast</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">BDS Dental Conversations</h1>
            <p className="text-xl opacity-90 mb-8">
              Listen to insightful discussions with Bahrain's dental leaders, 
              experts, and innovators. Explore topics ranging from clinical 
              advancements to professional development and community health.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <Headphones className="w-5 h-5 mr-2" />
                <span>{episodes.length} Episodes</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>20+ Expert Guests</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                <span>Dental Topics Covered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Episode Info */}
            <div className="lg:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#03215F] to-[#03215F] text-white text-sm font-semibold mb-2">
                    NOW PLAYING
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {episodes[currentEpisode].title}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#03215F]">
                    Episode {episodes[currentEpisode].id}
                  </div>
                  <div className="text-sm text-gray-600">
                    {episodes[currentEpisode].date}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                {episodes[currentEpisode].description}
              </p>

              {/* Guests */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Guests</h3>
                <div className="flex flex-wrap gap-2">
                  {episodes[currentEpisode].guests.map((guest, index) => (
                    <div 
                      key={index} 
                      className="px-3 py-2 bg-gray-50 rounded-lg flex items-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center text-white text-xs font-bold mr-2">
                        {guest.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {guest}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topics */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {episodes[currentEpisode].topics.map((topic, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Player Controls */}
            <div className="lg:w-1/3">
              <div className="bg-gray-50 rounded-xl p-6">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div 
                    className="h-2 bg-gray-200 rounded-full cursor-pointer mb-2"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-full"
                      style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatTime(currentTime)}</span>
                    <span>{episodes[currentEpisode].duration}</span>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-center space-x-6 mb-6">
                  <button 
                    onClick={handlePrevious}
                    className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={handlePlayPause}
                    className="p-4 rounded-full bg-gradient-to-r from-[#03215F] to-[#03215F] text-white hover:opacity-90 transition-opacity"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>
                  
                  <button 
                    onClick={handleNext}
                    className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#03215F]"
                  />
                  <span className="text-sm text-gray-600 w-10">
                    {volume}%
                  </span>
                </div>

                {/* Audio element (hidden) */}
                <audio 
                  ref={audioRef}
                  src={episodes[currentEpisode].audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* All Episodes */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            All Episodes
          </h2>
          
          <div className="space-y-6">
            {episodes.map((episode, index) => (
              <div 
                key={episode.id} 
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
                  index === currentEpisode ? 'border-2 border-[#03215F]' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Episode Number */}
                  <div className="md:w-20 flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center text-white text-2xl font-bold">
                      {episode.id}
                    </div>
                  </div>
                  
                  {/* Episode Details */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {episode.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {episode.description}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#03215F] mb-1">
                          {episode.duration}
                        </div>
                        <div className="text-sm text-gray-600">
                          {episode.date}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats and Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center text-gray-600">
                          <Headphones className="w-4 h-4 mr-2" />
                          <span className="text-sm">{episode.plays} plays</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">{episode.likes} likes</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => playEpisode(index)}
                          className={`px-4 py-2 rounded-lg font-semibold flex items-center ${
                            index === currentEpisode && isPlaying
                              ? 'bg-[#b8352d] text-white'
                              : 'bg-gradient-to-r from-[#03215F] to-[#03215F] text-white hover:opacity-90'
                          }`}
                        >
                          {index === currentEpisode && isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Play
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {/* Download functionality */}}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Podcast Platforms */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Subscribe on Your Favorite Platform
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {podcastPlatforms.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="text-3xl mb-3">{platform.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {platform.name}
                </h3>
                <div className="flex items-center justify-center text-[#03215F] text-sm">
                  <span>Subscribe</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Upcoming Episodes */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Upcoming Episodes
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Dental Tourism in Bahrain",
                scheduled: "March 29, 2024",
                description: "Exploring opportunities in dental tourism",
                guests: ["Industry Experts", "Tourism Officials"]
              },
              {
                title: "Women in Dentistry",
                scheduled: "April 5, 2024",
                description: "Celebrating women's contributions to dentistry",
                guests: ["Female Dental Leaders", "Mentors"]
              },
              {
                title: "Sustainable Dental Practice",
                scheduled: "April 12, 2024",
                description: "Eco-friendly approaches in dentistry",
                guests: ["Environmental Experts", "Practice Owners"]
              }
            ].map((episode, index) => (
              <div key={index} className="bg-white rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 text-[#03215F] mr-2" />
                  <span className="font-semibold text-gray-900">
                    {episode.scheduled}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {episode.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {episode.description}
                </p>
                <div className="text-sm text-gray-500">
                  Featuring: {episode.guests.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Suggestions */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Suggest a Topic or Guest
              </h2>
              <p className="opacity-90">
                Have ideas for future episodes? Want to suggest an expert guest? 
                We'd love to hear from our listeners.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:podcast@bahraindentalsociety.org"
                className="px-8 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-center flex items-center justify-center"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Suggest Topic
              </a>
              <a
                href="#"
                className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold text-center"
              >
                Guest Application
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}