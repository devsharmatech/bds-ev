"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Tags, Save, X } from "lucide-react";

export default function AdminGalleryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    tag1: "",
    tag2: "",
    is_active: true,
    featured_file: null,
    featured_preview: "",
    family_files: [],
  });

  const resetForm = () => {
    setForm({
      title: "",
      tag1: "",
      tag2: "",
      is_active: true,
      featured_file: null,
      featured_preview: "",
      family_files: [],
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed");
      setItems(data.galleries || []);
    } catch (e) {
      console.error(e);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = async (it) => {
    setEditing(it);
    setForm((f) => ({
      ...f,
      title: it.title || "",
      tag1: it.tag1 || "",
      tag2: it.tag2 || "",
      is_active: !!it.is_active,
      featured_file: null,
      featured_preview: it.featured_image_url || "",
      family_files: [],
    }));
    setIsModalOpen(true);
  };

  const onPickFeatured = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, featured_file: file, featured_preview: URL.createObjectURL(file) }));
  };

  const onPickFamily = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setForm((f) => ({ ...f, family_files: files }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.title.trim()) {
        toast.error("Title is required");
        setSaving(false);
        return;
      }
      const fd = new FormData();
      fd.append("title", form.title.trim());
      if (form.tag1) fd.append("tag1", form.tag1);
      if (form.tag2) fd.append("tag2", form.tag2);
      fd.append("is_active", String(!!form.is_active));
      if (form.featured_file) fd.append("featured_image", form.featured_file);
      form.family_files.forEach((f) => fd.append("family_images", f));

      const url = editing ? `/api/admin/gallery/${editing.id}` : "/api/admin/gallery";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Save failed");
      toast.success("Saved");
      setIsModalOpen(false);
      resetForm();
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (it) => {
    if (!confirm(`Delete "${it.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/gallery/${it.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      toast.success("Deleted");
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const removeFamilyImage = async (imageId) => {
    try {
      const res = await fetch(`/api/admin/gallery-images/${imageId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to remove image");
      toast.success("Removed");
      // refresh editing data
      if (editing) {
        const refreshed = await fetch(`/api/admin/gallery/${editing.id}`).then((r) => r.json());
        if (refreshed.success) {
          // just refresh the list; modal shows preview only of featured
          await load();
        }
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const [imagesById, setImagesById] = useState({});
  useEffect(() => {
    (async () => {
      if (!isModalOpen || !editing) return;
      // load images for editing
      try {
        const res = await fetch(`/api/admin/gallery/${editing.id}`);
        const data = await res.json();
        if (data.success) {
          const byId = {};
          (data.images || []).forEach((im) => {
            byId[im.id] = im;
          });
          setImagesById(byId);
        }
      } catch (_e) {}
    })();
  }, [isModalOpen, editing]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gallery Manager</h1>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            New Gallery
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <div key={it.id} className="bg-white rounded-xl shadow p-4">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                  {it.featured_image_url ? (
                    <img src={it.featured_image_url} alt={it.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{it.title}</div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        it.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {it.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    {it.tag1 ? <span className="px-2 py-1 bg-gray-100 rounded">{it.tag1}</span> : null}
                    {it.tag2 ? <span className="px-2 py-1 bg-gray-100 rounded">{it.tag2}</span> : null}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(it)}
                    className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => removeItem(it)}
                    className="px-3 py-2 rounded bg-[#b8352d] text-white hover:opacity-90 inline-flex items-center gap-1 disabled:opacity-60"
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? "Edit Gallery" : "New Gallery"}
        size="xl"
      >
        <form onSubmit={save} className="space-y-6">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#03215F]"
                  placeholder="Gallery title"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag 1</label>
                <input
                  value={form.tag1}
                  onChange={(e) => setForm({ ...form, tag1: e.target.value })}
                  className="w-full px-3 py-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#03215F]"
                  placeholder="e.g., Annual Gala"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag 2</label>
                <input
                  value={form.tag2}
                  onChange={(e) => setForm({ ...form, tag2: e.target.value })}
                  className="w-full px-3 py-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#03215F]"
                  placeholder="e.g., 2025"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
            <div className="flex items-center gap-4">
              <div className="w-40 h-28 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {form.featured_preview ? (
                  <img src={form.featured_preview} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={onPickFeatured} />
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Family Images</label>
            <input type="file" accept="image/*" multiple onChange={onPickFamily} />
            <p className="text-xs text-gray-500 mt-1">You can select multiple images.</p>
            {editing ? (
              <ExistingFamilyImages galleryId={editing.id} onRemove={removeFamilyImage} />
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border text-gray-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ExistingFamilyImages({ galleryId, onRemove }) {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/gallery/${galleryId}`);
      const data = await res.json();
      if (data.success) setImages(data.images || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [galleryId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading images...
      </div>
    );
  }

  if (!images.length) return null;

  return (
    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map((im) => (
        <div key={im.id} className="relative rounded overflow-hidden bg-gray-100">
          <img src={im.image_url} className="w-full h-28 object-cover" />
          <button
            type="button"
            onClick={() => onRemove(im.id)}
            className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 shadow"
            title="Remove"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ))}
    </div>
  );
}


