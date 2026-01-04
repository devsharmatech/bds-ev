"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  User,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  Eye,
  Clock,
  BookOpen,
  File,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import toast, { Toaster } from "react-hot-toast";

export default function ResearchPage() {
  const [loading, setLoading] = useState(true);
  const [research, setResearch] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at.desc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Load research
  const loadResearch = useCallback(async (page = 1, append = false, search = null, category = null, customCat = null) => {
    if (!append) setLoading(true);
    try {
      const searchTerm = search !== null ? search : searchQuery;
      const categoryFilter = category !== null ? category : selectedCategory;
      const customCatFilter = customCat !== null ? customCat : customCategory;
      
      // Use custom category if "Other" is selected, otherwise use selected category
      const finalCategory = categoryFilter === "Other" && customCatFilter.trim() 
        ? customCatFilter.trim() 
        : (categoryFilter || "");
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        sort: sortBy,
        ...(searchTerm && { q: searchTerm }),
        ...(finalCategory && { category: finalCategory }),
      });

      const res = await fetch(`/api/research?${params}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load research");
      }

      if (append) {
        setResearch((prev) => [...prev, ...(data.research || [])]);
      } else {
        setResearch(data.research || []);
      }

      setPagination((prev) => ({
        ...prev,
        page: data.pagination?.page || 1,
        total: data.pagination?.total || 0,
        total_pages: data.pagination?.total_pages || 0,
      }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.per_page, sortBy, searchQuery, selectedCategory, customCategory]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadResearch(1, false, searchQuery, selectedCategory, customCategory);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, loadResearch]);

  // Debounced custom category filter effect
  useEffect(() => {
    if (selectedCategory !== "Other") return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (customCategory.trim()) {
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadResearch(1, false, searchQuery, selectedCategory, customCategory.trim());
      } else if (customCategory === "") {
        // If custom category is cleared, reload without category filter
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadResearch(1, false, searchQuery, "", "");
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [customCategory, selectedCategory, searchQuery, loadResearch]);

  useEffect(() => {
    loadResearch(1, false);
  }, [sortBy, selectedCategory, customCategory, loadResearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadResearch(1, false);
  };

  const handleViewDetails = (item) => {
    setSelectedResearch(item);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFileTypeIcon = (url) => {
    if (!url) return <FileText className="w-5 h-5" />;
    const ext = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <FileText className="w-5 h-5" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <Eye className="w-5 h-5" />;
    if (['doc', 'docx'].includes(ext)) return <BookOpen className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: {
            background: '#03215F',
            color: '#fff',
          },
        }} />

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#03215F] via-[#0A2A7A] to-[#03215F] text-white py-16 md:py-24">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Research Portal</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Research & <span className="text-[#AE9B66]">Publications</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Explore groundbreaking dental research, clinical studies, and scientific publications from leading experts in the field.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>Updated Weekly</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span>Peer-Reviewed</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search research papers, studies, authors..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03215F]/20 focus:border-[#03215F] bg-gray-50/50 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        loadResearch(1, false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03215F]/20 focus:border-[#03215F] bg-gray-50/50"
                >
                  <option value="created_at.desc">Newest First</option>
                  <option value="created_at.asc">Oldest First</option>
                  <option value="title.asc">Title A-Z</option>
                  <option value="title.desc">Title Z-A</option>
                  <option value="views.desc">Most Viewed</option>
                </select>
                
                <button
                  type="submit"
                  onClick={handleSearch}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#03215F] to-[#0A2A7A] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publication Year
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                        <option>All Years</option>
                        <option>2024</option>
                        <option>2023</option>
                        <option>2022</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          if (e.target.value !== "Other") {
                            setCustomCategory("");
                          }
                          setPagination({ ...pagination, page: 1 });
                          const finalCat = e.target.value === "Other" && customCategory.trim() 
                            ? customCategory.trim() 
                            : e.target.value;
                          loadResearch(1, false, searchQuery, e.target.value, e.target.value === "Other" ? customCategory : "");
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="">All Categories</option>
                        <option value="Clinical Studies">Clinical Studies</option>
                        <option value="Case Reports">Case Reports</option>
                        <option value="Review Articles">Review Articles</option>
                        <option value="Research Papers">Research Papers</option>
                        <option value="Systematic Reviews">Systematic Reviews</option>
                        <option value="Meta-Analysis">Meta-Analysis</option>
                        <option value="Other">Other</option>
                      </select>
                      {selectedCategory === "Other" && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Category <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => {
                              setCustomCategory(e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#03215F]/20 focus:border-[#03215F]"
                            placeholder="Enter custom category name"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter the category name to filter by
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Type
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                        <option>All Access</option>
                        <option>Open Access</option>
                        <option>Subscription</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-lg font-semibold text-gray-900">
              {loading ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <>
                  {pagination.total} Research {pagination.total === 1 ? 'Paper' : 'Papers'} Found
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.total_pages}
            </div>
          </div>

          {/* Research Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : research.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#03215F]/10 to-[#AE9B66]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No research papers found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "New research publications will be added soon"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    loadResearch(1, false);
                  }}
                  className="px-6 py-3 text-[#03215F] border border-[#03215F] rounded-lg hover:bg-[#03215F] hover:text-white transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              >
                {research.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    {item.featured_image_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.featured_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full">
                            {getFileTypeIcon(item.research_content_url)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-[#03215F]/5 via-[#AE9B66]/5 to-[#03215F]/5 flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">Research Paper</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <CalendarDays className="w-3 h-3" />
                        <span>{formatDate(item.created_at)}</span>
                        {item.category && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="px-2 py-0.5 bg-[#03215F]/10 text-[#03215F] rounded-full">{item.category}</span>
                          </>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-[#03215F] transition-colors">
                        {item.title}
                      </h3>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-6">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{item.researcher_name || "Anonymous"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group/btn"
                        >
                          <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span>Preview</span>
                        </button>
                        {item.research_content_url && (
                          <a
                            href={item.research_content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#0A2A7A] text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>PDF</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {((pagination.page - 1) * pagination.per_page) + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(pagination.page * pagination.per_page, pagination.total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">{pagination.total}</span>{" "}
                    results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newPage = pagination.page - 1;
                        setPagination({ ...pagination, page: newPage });
                        loadResearch(newPage, false);
                      }}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                        let pageNum;
                        if (pagination.total_pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.total_pages - 2) {
                          pageNum = pagination.total_pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              setPagination({ ...pagination, page: pageNum });
                              loadResearch(pageNum, false);
                            }}
                            className={`w-10 h-10 rounded-lg transition-colors ${
                              pagination.page === pageNum
                                ? "bg-[#03215F] text-white"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                        const newPage = pagination.page + 1;
                        setPagination({ ...pagination, page: newPage });
                        loadResearch(newPage, false);
                      }}
                      disabled={pagination.page >= pagination.total_pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Research Detail Modal */}
        <AnimatePresence>
          {isModalOpen && selectedResearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="relative h-64 bg-gradient-to-r from-[#03215F] to-[#0A2A7A]">
                  {selectedResearch.featured_image_url ? (
                    <img
                      src={selectedResearch.featured_image_url}
                      alt={selectedResearch.title}
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-20 h-20 text-white/50" />
                    </div>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#03215F]/10 text-[#03215F] text-sm font-medium rounded-full">
                      Research Paper
                    </span>
                    {selectedResearch.category && (
                      <span className="px-3 py-1 bg-[#AE9B66]/10 text-[#AE9B66] text-sm font-medium rounded-full">
                        {selectedResearch.category}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      Published {formatDate(selectedResearch.created_at)}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedResearch.title}
                  </h2>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 font-medium">
                        {selectedResearch.researcher_name}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="text-gray-500">
                      {selectedResearch.institution || "Independent Researcher"}
                    </div>
                  </div>
                  
                  <div className="prose max-w-none text-gray-600 mb-8">
                    <p className="text-lg leading-relaxed">{selectedResearch.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    {selectedResearch.research_content_url && (
                      <a
                        href={selectedResearch.research_content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#0A2A7A] text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download Full Paper
                      </a>
                    )}
                    {selectedResearch.external_link && (
                      <a
                        href={selectedResearch.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="w-5 h-5" />
                        View External Source
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}