"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Save, Filter } from "lucide-react";
import Modal from "@/components/Modal";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { toast } from "sonner";

export default function AdminCommitteePagesPage() {
  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    committee_id: "",
    slug: "",
    title: "",
    content: "",
    sort_order: 0,
    is_active: true,
  });

  const loadCommittees = async () => {
    try {
      const res = await fetch("/api/admin/committees");
      const data = await res.json();
      if (data.success) setCommittees(data.committees || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load committees");
    }
  };

  const loadPages = async () => {
    setLoading(true);
    try {
      const url = selectedCommitteeId
        ? `/api/admin/committee-pages?committee_id=${selectedCommitteeId}`
        : `/api/admin/committee-pages`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPages(data.pages || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load committee pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommittees();
  }, []);

  useEffect(() => {
    loadPages();
  }, [selectedCommitteeId]);

  const openNew = () => {
    setEditing(null);
    setForm({
      committee_id: selectedCommitteeId || "",
      slug: "",
      title: "",
      content: "",
      sort_order: 0,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      committee_id: p.committee_id,
      slug: p.slug,
      title: p.title,
      content: p.content || "",
      sort_order: p.sort_order || 0,
      is_active: !!p.is_active,
    });
    setIsModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.committee_id) {
        toast.error("Please select a committee");
        setSaving(false);
        return;
      }
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      const res = await fetch(
        editing ? `/api/admin/committee-pages/${editing.id}` : "/api/admin/committee-pages",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Save failed");
      toast.success("Committee page saved");
      setIsModalOpen(false);
      await loadPages();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Delete page "${p.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/committee-pages/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      toast.success("Deleted");
      await loadPages();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Committee Pages</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCommitteeId}
                onChange={(e) => setSelectedCommitteeId(e.target.value)}
                className="px-3 py-2 border rounded text-sm"
              >
                <option value="">All committees</option>
                {committees.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              New Page
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{p.title}</div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">/{p.slug}</div>
                <div className="mt-2 text-xs text-gray-500">Order: {p.sort_order ?? 0}</div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center gap-1"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p)}
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

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Edit Committee Page" : "New Committee Page"} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Committee</label>
              <select
                value={form.committee_id}
                onChange={(e) => setForm({ ...form, committee_id: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select committee</option>
                {committees.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="overview, objectives, members, etc"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                id="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
            </div>
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


