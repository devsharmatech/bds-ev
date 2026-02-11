"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFile } from "@/lib/uploadClient";
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Upload,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = {
  id: "",
  title: "",
  subtitle: "",
  description: "",
  imageFile: null,
  imageUrl: "",
  removeImage: false,
  slideType: "content",
  buttonText: "",
  buttonUrl: "",
  showStatsRow: true,
  secondaryButtonText: "",
  secondaryButtonUrl: "",
};

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero-slides");
      const data = await res.json();
      if (data.success) {
        const sorted = (data.slides || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        setSlides(sorted);
      } else {
        toast.error(data.error || "Failed to load slides");
      }
    } catch (e) {
      console.error("Hero slides fetch error", e);
      toast.error("Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setShowForm(false);
  };

  const persistOrder = async (updatedSlides) => {
    try {
      const orderedIds = (updatedSlides || []).map((s) => s.id);
      const res = await fetch("/api/admin/hero-slides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      const data = await res.json();
      if (data.success) {
        const sorted = (data.slides || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        setSlides(sorted);
      } else {
        toast.error(data.error || "Failed to reorder slides");
      }
    } catch (e) {
      console.error("Reorder slides error", e);
      toast.error("Failed to reorder slides");
    }
  };

  const handleMove = (index, direction) => {
    setSlides((prev) => {
      const updated = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      // Optimistically update UI
      persistOrder(updated);
      return updated.map((s, idx) => ({ ...s, sort_order: idx }));
    });
  };

  const handleToggleActive = async (slide) => {
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slide.id, is_active: slide.is_active === false }),
      });
      const data = await res.json();
      if (data.success) {
        const sorted = (data.slides || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        setSlides(sorted);
        toast.success(slide.is_active === false ? "Slide activated" : "Slide deactivated");
      } else {
        toast.error(data.error || "Failed to update slide status");
      }
    } catch (e) {
      console.error("Toggle slide active error", e);
      toast.error("Failed to update slide status");
    }
  };

  const handleEdit = (slide) => {
    setForm({
      id: slide.id,
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      description: slide.description || "",
      slideType: slide.slide_type || "content",
      buttonText: slide.button_text || "",
      buttonUrl: slide.button_url || "",
      showStatsRow:
        slide.show_stats_row === undefined || slide.show_stats_row === null
          ? true
          : !!slide.show_stats_row,
      secondaryButtonText: slide.secondary_button_text || "",
      secondaryButtonUrl: slide.secondary_button_url || "",
      imageFile: null,
      imageUrl: slide.image_url || "",
      removeImage: false,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (slide) => {
    if (!confirm(`Delete slide "${slide.title || "untitled"}"?`)) return;
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slide.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSlides(data.slides || []);
        toast.success("Slide deleted");
      } else {
        toast.error(data.error || "Failed to delete slide");
      }
    } catch (e) {
      console.error("Delete slide error", e);
      toast.error("Failed to delete slide");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {};
      if (isEditing) payload.id = form.id;
      if (form.title) payload.title = form.title;
      if (form.subtitle) payload.subtitle = form.subtitle;
      if (form.description) payload.description = form.description;
      if (form.slideType) payload.slide_type = form.slideType;
      payload.show_stats_row = form.showStatsRow ? true : false;
      if (form.buttonText) payload.button_text = form.buttonText;
      if (form.buttonUrl) payload.button_url = form.buttonUrl;
      if (form.secondaryButtonText) payload.secondary_button_text = form.secondaryButtonText;
      if (form.secondaryButtonUrl) payload.secondary_button_url = form.secondaryButtonUrl;
      if (form.removeImage) payload.remove_image = true;

      // Upload image directly if provided
      if (form.imageFile) {
        const result = await uploadFile(form.imageFile, "media", "hero-slides");
        payload.image_url = result.publicUrl;
      }

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch("/api/admin/hero-slides", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const sorted = (data.slides || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        setSlides(sorted);
        toast.success(isEditing ? "Slide updated" : "Slide created");
        resetForm();
      } else {
        toast.error(data.error || "Failed to save slide");
      }
    } catch (e) {
      console.error("Save slide error", e);
      toast.error("Failed to save slide");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
          <p className="text-gray-600 mt-1">
            Manage the content slides shown in the homepage hero section, including text and optional images.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setForm(emptyForm);
              setIsEditing(false);
              setShowForm(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? "Edit Slide" : "Create New Slide"}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                    placeholder="e.g. Welcome to Bahrain Dental Society"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subtitle (optional)</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                    placeholder="Short label shown above description"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Slide Type</label>
                  <select
                    value={form.slideType}
                    onChange={(e) => setForm((f) => ({ ...f, slideType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm bg-white"
                  >
                    <option value="content">Content (heading + text)</option>
                    <option value="image">Image focused</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Content slides show hero text. Image slides can focus more on the visual.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Primary Button Text</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                    placeholder="e.g. Join Now"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Primary Button Link</label>
                  <input
                    type="text"
                    value={form.buttonUrl}
                    onChange={(e) => setForm((f) => ({ ...f, buttonUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                    placeholder="https://... or /membership"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Secondary Button Text</label>
                  <input
                    type="text"
                    value={form.secondaryButtonText}
                    onChange={(e) => setForm((f) => ({ ...f, secondaryButtonText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                    placeholder="e.g. Learn More"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Secondary Button Link</label>
                  <input
                    type="text"
                    value={form.secondaryButtonUrl}
                    onChange={(e) => setForm((f) => ({ ...f, secondaryButtonUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                    placeholder="https://... or /about"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Stats Row Visibility</span>
                  <div className="mt-2 space-y-1.5">
                    <label className="flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.showStatsRow}
                        onChange={(e) => setForm((f) => ({ ...f, showStatsRow: e.target.checked }))}
                        className="rounded border-gray-300 text-[#03215F] focus:ring-[#03215F]"
                      />
                      <span>Show full stats row (all four cards)</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Turn this off to hide the entire stats row (members, events, CME, years) for this slide.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm resize-none"
                  placeholder="Hero text that appears under the main heading"
                />
                <p className="text-xs text-gray-500">
                  This text will appear in the left card area of the hero section. Keep it concise and impactful.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Optional Slide Image
                </label>
                {isEditing && form.imageUrl && !form.removeImage && !form.imageFile && (
                  <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={form.imageUrl}
                      alt="Current slide"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {form.imageFile && (
                  <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={URL.createObjectURL(form.imageFile)}
                      alt="Selected slide"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition">
                    <Upload className="w-4 h-4" />
                    {form.imageFile ? "Change Image" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setForm((f) => ({ ...f, imageFile: file, removeImage: false }));
                      }}
                    />
                  </label>
                  {isEditing && form.imageUrl && !form.imageFile && !form.removeImage && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, removeImage: true }))}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Image
                    </button>
                  )}
                  <p className="text-xs text-gray-500">
                    Recommended landscape image, max 5MB. Shown beside the hero text on desktop and above it on mobile.
                  </p>
                </div>
                {isEditing && form.removeImage && (
                  <p className="text-xs text-red-600">Image will be removed when you save.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {isEditing ? "Update Slide" : "Create Slide"}
                    </>
                  )}
                </button>
              </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slides List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Slides</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-[#03215F] animate-spin" />
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No hero slides yet. Click "Add Slide" to create your first one.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col"
              >
                {slide.image_url ? (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={slide.image_url}
                      alt={slide.title || "Hero slide"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-50 text-gray-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {slide.title || "Untitled slide"}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-xs text-gray-500 mb-1 truncate">{slide.subtitle}</p>
                  )}
                  {slide.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">{slide.description}</p>
                  )}
                  <div className="mt-auto space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Slide #{(slide.sort_order ?? index) + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(slide)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition ${
                          slide.is_active === false
                            ? "bg-gray-50 text-gray-500 border-gray-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {slide.is_active === false ? (
                          <ToggleLeft className="w-3 h-3" />
                        ) : (
                          <ToggleRight className="w-3 h-3" />
                        )}
                        {slide.is_active === false ? "Inactive" : "Active"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={index === slides.length - 1}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(slide)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(slide)}
                          className="p-1.5 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
