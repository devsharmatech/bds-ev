"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  X,
  Tags,
  Users,
  DollarSign,
  Clock,
  Building,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CalendarDays,
  Tag,
  Shield,
  FileText,
  User,
  Mic,
  ListChecks,
  MessageSquare,
  Save,
  Star,
  Grid3X3,
  ImageOff,
  CheckSquare,
  Square,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/Modal";
import DeleteModal2 from "@/components/DeleteModal2";
import { uploadFile } from "@/lib/uploadClient";

export default function AdminGalleryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewImages, setViewImages] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "active",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    short_description: "",
    tag1: "",
    tag2: "",
    is_active: true,
    featured_file: null,
    featured_preview: "",
    family_files: [],
    family_previews: [],
  });

  // Load galleries with pagination and filters
  const loadGalleries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const res = await fetch(`/api/admin/gallery?${params}`, { credentials: "include" });
      const data = await res.json();
      
      if (data.success) {
        setItems(data.galleries || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 9,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        toast.error(data.message || "Failed to load galleries");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load galleries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleries();
  }, [pagination.page, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      tag1: "",
      tag2: "",
      is_active: true,
      featured_file: null,
      featured_preview: "",
      family_files: [],
      family_previews: [],
    });
  };

  // Open create modal
  const openCreateModal = () => {
    setEditing(null);
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = async (item) => {
    setEditing(item);
    setForm((f) => ({
      ...f,
      title: item.title || "",
      tag1: item.tag1 || "",
      tag2: item.tag2 || "",
      is_active: !!item.is_active,
      featured_file: null,
      featured_preview: item.featured_image_url || "",
      family_files: [],
      family_previews: [],
    }));
    setShowCreateModal(true);
  };

  // Open delete modal
  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Handle featured image selection
  const onPickFeatured = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, WEBP, GIF)");
      return;
    }
    
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    
    setForm((f) => ({ 
      ...f, 
      featured_file: file, 
      featured_preview: URL.createObjectURL(file) 
    }));
  };

  // Handle family images selection
  const onPickFamily = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;
    const validFiles = [];
    const previews = [];
    
    files.forEach(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type for ${file.name}. Please upload images only.`);
        return;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        return;
      }
      
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });
    
    if (validFiles.length > 0) {
      setForm((f) => ({ 
        ...f, 
        family_files: [...f.family_files, ...validFiles],
        family_previews: [...f.family_previews, ...previews]
      }));
    }
  };

  // Remove family image preview
  const removeFamilyPreview = (index) => {
    setForm((f) => {
      const newFiles = [...f.family_files];
      const newPreviews = [...f.family_previews];
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);
      return { ...f, family_files: newFiles, family_previews: newPreviews };
    });
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    
    try {
      if (!form.title.trim()) {
        toast.error("Title is required");
        setModalLoading(false);
        return;
      }

      // Upload files directly to Supabase Storage first
      let featured_image_url = form.featured_preview || null;
      if (form.featured_file) {
        toast.loading("Uploading featured image...", { id: "gallery-upload" });
        featured_image_url = await uploadFile(form.featured_file, "gallery", "featured");
      }

      const family_image_urls = [];
      if (form.family_files.length > 0) {
        toast.loading(`Uploading ${form.family_files.length} images...`, { id: "gallery-upload" });
        for (let i = 0; i < form.family_files.length; i++) {
          toast.loading(`Uploading image ${i + 1}/${form.family_files.length}...`, { id: "gallery-upload" });
          const url = await uploadFile(form.family_files[i], "gallery", "albums");
          family_image_urls.push(url);
        }
      }
      toast.dismiss("gallery-upload");

      // Send JSON with pre-uploaded URLs
      const jsonBody = {
        title: form.title.trim(),
        short_description: form.short_description || null,
        tag1: form.tag1 || null,
        tag2: form.tag2 || null,
        is_active: !!form.is_active,
      };
      if (featured_image_url) jsonBody.featured_image_url = featured_image_url;
      if (family_image_urls.length > 0) jsonBody.family_image_urls = family_image_urls;

      const url = editing ? `/api/admin/gallery/${editing.id}` : "/api/admin/gallery";
      const method = editing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonBody),
        credentials: "include",
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Save failed");
      }
      
      toast.success(editing ? "Gallery updated successfully" : "Gallery created successfully");
      setShowCreateModal(false);
      resetForm();
      await loadGalleries();
      
    } catch (err) {
      toast.dismiss("gallery-upload");
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/gallery/${selectedItem.id}`, { 
        method: "DELETE",
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }
      
      toast.success("Gallery deleted successfully");
      setShowDeleteModal(false);
      setSelectedItem(null);
      await loadGalleries();
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Load images for view modal
  useEffect(() => {
    (async () => {
      if (!showViewModal || !selectedItem) return;
      setViewLoading(true);
      try {
        const res = await fetch(`/api/admin/gallery/${selectedItem.id}`, { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setViewImages(data.images || []);
        } else {
          setViewImages([]);
        }
      } catch {
        setViewImages([]);
      } finally {
        setViewLoading(false);
      }
    })();
  }, [showViewModal, selectedItem]);

  // Status badge component
  const StatusBadge = ({ isActive }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? "bg-green-100 text-green-700" 
        : "bg-gray-100 text-gray-600"
    }`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  // Tag badge component
  const TagBadge = ({ tag }) => (
    tag && (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
        <Tag className="w-3 h-3" />
        {tag}
      </span>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedItem && (
          <DeleteModal2
            title="Delete Gallery"
            description={
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{selectedItem.title}"</span>? This will permanently remove
                the gallery and its images.
              </>
            }
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
            loading={modalLoading}
          />
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedItem && (
          <Modal
            open={showViewModal}
            onClose={() => setShowViewModal(false)}
            title={selectedItem.title || "Gallery"}
            size="2xl"
          >
            <div className="space-y-6">
              {/* Featured image + tags */}
              <div className="flex items-start gap-4">
                <div className="w-64 h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {selectedItem.featured_image_url ? (
                    <img src={selectedItem.featured_image_url} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge isActive={selectedItem.is_active} />
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(selectedItem.updated_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedItem.tag1 && <TagBadge tag={selectedItem.tag1} />}
                    {selectedItem.tag2 && <TagBadge tag={selectedItem.tag2} />}
                  </div>
                </div>
              </div>

              {/* Images grid */}
              {viewLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading images...
                </div>
              ) : viewImages.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No images in this gallery.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {viewImages.map((im) => (
                    <div key={im.id} className="relative rounded overflow-hidden bg-gray-100">
                      <img src={im.image_url} className="w-full h-28 object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title={editing ? "Edit Gallery" : "Create New Gallery"}
            size="2xl"
          >
            <form onSubmit={handleSave} className="space-y-6">
              {/* Gallery Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Gallery Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gallery Title *
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      placeholder="Enter gallery title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      value={form.short_description}
                      onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent resize-none text-sm"
                      placeholder="Optional short description shown on the website"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tag 1
                    </label>
                    <div className="relative">
                      <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        value={form.tag1}
                        onChange={(e) => setForm({ ...form, tag1: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="e.g., Annual Gala"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tag 2
                    </label>
                    <div className="relative">
                      <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        value={form.tag2}
                        onChange={(e) => setForm({ ...form, tag2: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="e.g., 2025"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end md:justify-start">
                    <label className="flex items-center gap-2 p-4 bg-white border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      {form.is_active ? (
                        <CheckSquare className="w-5 h-5 text-[#03215F]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active Gallery
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Featured Image */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Featured Image
                </h3>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="aspect-[16/9] w-full max-w-xs bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden">
                      {form.featured_preview ? (
                        <img 
                          src={form.featured_preview} 
                          alt="Featured preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6">
                          <Camera className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-500 text-center">
                            No featured image selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Featured Image *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onPickFeatured}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-[#9cc2ed] file:to-[#9cc2ed] file:text-[#03215F] hover:file:opacity-90"
                          />
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700">
                          <span className="font-semibold">Recommended:</span> Use high-quality images 
                          (JPG, PNG, WEBP) under 5MB. Featured image will be displayed as the main cover.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Family Images */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Gallery Images
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {form.family_files.length} images selected
                  </span>
                </div>
                
                {/* Image upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Multiple Images
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onPickFamily}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-[#9cc2ed] file:to-[#9cc2ed] file:text-[#03215F] hover:file:opacity-90"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    You can select multiple images at once. Drag and drop is also supported.
                  </p>
                </div>

                {/* Image previews */}
                {form.family_previews.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {form.family_previews.map((preview, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFamilyPreview(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-xs text-white truncate">
                              {form.family_files[index]?.name}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing images for editing */}
                {editing && (
                  <ExistingFamilyImages galleryId={editing.id} />
                )}
              </motion.div>

              {/* Modal Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200"
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editing ? "Update Gallery" : "Create Gallery"}
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      <div className="mx-auto space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] shadow-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  Gallery Manager
                </h1>
                <p className="text-gray-600 mt-1">
                  Create, manage, and showcase image galleries
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Gallery
            </button>
          </div>
        </motion.div>

        {/* FILTERS AND SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search galleries..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent appearance-none"
              >
                <option value="created_at">Created Date</option>
                <option value="title">Title</option>
                <option value="updated_at">Updated Date</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleFilterChange(
                    "sortOrder",
                    filters.sortOrder === "asc" ? "desc" : "asc"
                  )
                }
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* GALLERY GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mb-4" />
              <p className="text-gray-600">Loading galleries...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Camera className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                No galleries found
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {filters.search || filters.status !== "all"
                  ? "Try changing your filters"
                  : "Create your first gallery to get started"}
              </p>
              <button
                onClick={openCreateModal}
                className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Gallery
              </button>
            </div>
          ) : (
            <>
              {/* Cards Grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      {/* Image */}
                      <div className="relative h-48 w-full overflow-hidden">
                        {item.featured_image_url ? (
                          <img
                            src={item.featured_image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                            <Camera className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">No image</p>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <StatusBadge isActive={item.is_active} />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <h3 className="font-semibold text-white truncate capitalize">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {item.tag1 && <TagBadge tag={item.tag1} />}
                          {item.tag2 && <TagBadge tag={item.tag2} />}
                          {!item.tag1 && !item.tag2 && (
                            <span className="text-xs text-gray-500 italic">
                              No tags
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4" />
                            <span>
                              {item.image_count || 0} images
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Updated: {new Date(item.updated_at).toLocaleDateString('en-BH', { timeZone: 'Asia/Bahrain' })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200/60">
                          <button
                            onClick={async () => {
                              setSelectedItem(item);
                              setShowViewModal(true);
                            }}
                            className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-105 active:scale-95"
                            title="View Live"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 rounded-lg bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F] hover:text-[#03215F] transition-colors hover:scale-105 active:scale-95"
                              title="Edit Gallery"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item)}
                              className="p-2 rounded-lg bg-gradient-to-r from-[#b8352d] to-[#b8352d] text-white hover:opacity-90 transition-colors hover:scale-105 active:scale-95"
                              title="Delete Gallery"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {pagination.total}
                    </span>{" "}
                    galleries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition-transform"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                pagination.page === pageNum
                                  ? "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white"
                                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition-transform"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Existing Family Images Component
function ExistingFamilyImages({ galleryId }) {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/gallery/${galleryId}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setImages(data.images || []);
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = async (imageId) => {
    if (!confirm("Are you sure you want to remove this image?")) return;
    
    try {
      const res = await fetch(`/api/admin/gallery-images/${imageId}`, { 
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Image removed successfully");
        await loadImages();
      } else {
        throw new Error(data.message || "Failed to remove image");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (galleryId) {
      loadImages();
    }
  }, [galleryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Loading existing images...</span>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <ImageOff className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No existing images in this gallery</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Images</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative group"
          >
            <div className="aspect-square rounded-xl overflow-hidden border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
              <img 
                src={image.image_url} 
                alt={`Gallery image ${image.id}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => removeImage(image.id)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}