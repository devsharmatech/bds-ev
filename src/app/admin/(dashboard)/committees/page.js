"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Save } from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "sonner";

export default function AdminCommitteesPage() {
  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    hero_title: "",
    hero_subtitle: "",
    focus: "",
    description: "",
    banner_image: "",
    contact_email: "",
    sort_order: 0,
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/committees");
      const data = await res.json();
      if (data.success) {
        setCommittees(data.committees);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load committees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({
      slug: "",
      name: "",
      hero_title: "",
      hero_subtitle: "",
      focus: "",
      description: "",
      banner_image: "",
      contact_email: "",
      sort_order: 0,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      slug: c.slug || "",
      name: c.name || "",
      hero_title: c.hero_title || "",
      hero_subtitle: c.hero_subtitle || "",
      focus: c.focus || "",
      description: c.description || "",
      banner_image: c.banner_image || "",
      contact_email: c.contact_email || "",
      sort_order: c.sort_order || 0,
      is_active: !!c.is_active,
    });
    setIsModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      const res = await fetch(
        editing ? `/api/admin/committees/${editing.id}` : "/api/admin/committees",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Save failed");
      toast.success("Committee saved");
      setIsModalOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete committee "${c.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/committees/${c.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      toast.success("Deleted");
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Committees</h1>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            New Committee
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committees.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Slug</div>
                    <div className="font-semibold">{c.slug}</div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-bold text-gray-900">{c.name}</div>
                </div>
                {c.focus && (
                  <div className="mt-2 text-sm text-gray-600 line-clamp-2">{c.focus}</div>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center gap-1"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="px-3 py-2 rounded bg-[#b8352d] text-white hover:opacity-90 inline-flex items-center gap-1"
                    title="Delete"
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

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Edit Committee" : "New Committee"} size="lg">
        <form onSubmit={save} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded bg-white"
                placeholder="professional-affairs-committee"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded bg-white"
                placeholder="Professional Affairs Committee"
              />
            </div>
          </div>
          </div>

          {/* Hero Text */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Hero Text</h3>
            <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input
                value={form.hero_title}
                onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
              <input
                value={form.hero_subtitle}
                onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>
          </div>
          </div>

          {/* Focus & Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Focus</label>
            <input
              value={form.focus}
              onChange={(e) => setForm({ ...form, focus: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-white"
              placeholder="Promoting high standards of practice..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded h-28 bg-white"
            />
          </div>
          {/* Media & Meta */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
              <input
                value={form.banner_image}
                onChange={(e) => setForm({ ...form, banner_image: e.target.value })}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded border text-gray-700"
            >
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


