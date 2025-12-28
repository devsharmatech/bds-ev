"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Save, Filter, Image as ImageIcon } from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "sonner";

export default function AdminCommitteeMembersPage() {
  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    committee_id: "",
    name: "",
    position: "",
    specialty: "",
    role: "",
    photo_url: "",
    photo_file: null,
    photo_preview: "",
    sort_order: 0,
  });

  const loadCommittees = async () => {
    try {
      const res = await fetch("/api/admin/committees");
      const data = await res.json();
      if (data.success) setCommittees(data.committees || []);
    } catch (e) {
      toast.error("Failed to load committees");
    }
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const url = selectedCommitteeId
        ? `/api/admin/committee-members?committee_id=${selectedCommitteeId}`
        : `/api/admin/committee-members`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setMembers(data.members || []);
    } catch (e) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommittees();
  }, []);

  useEffect(() => {
    loadMembers();
  }, [selectedCommitteeId]);

  const openNew = () => {
    setEditing(null);
    setForm({
      committee_id: selectedCommitteeId || "",
      name: "",
      position: "",
      specialty: "",
      role: "",
      photo_url: "",
      sort_order: 0,
    });
    setIsModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      committee_id: selectedCommitteeId || "",
      name: m.name || "",
      position: m.position || "",
      specialty: m.specialty || "",
      role: m.role || "",
      photo_url: m.photo_url || "",
      photo_file: null,
      photo_preview: m.photo_url || "",
      sort_order: m.sort_order || 0,
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
      const fd = new FormData();
      fd.set("committee_id", form.committee_id);
      fd.set("name", form.name);
      fd.set("position", form.position || "");
      fd.set("specialty", form.specialty || "");
      fd.set("role", form.role || "");
      fd.set("sort_order", String(Number(form.sort_order) || 0));
      if (form.photo_file) {
        fd.set("photo", form.photo_file);
      } else if (form.photo_url && !editing) {
        // allow existing URL only on create if provided (not typical)
        fd.set("photo_url", form.photo_url);
      }
      const res = await fetch(
        editing ? `/api/admin/committee-members/${editing.id}` : "/api/admin/committee-members",
        {
          method: editing ? "PUT" : "POST",
          body: fd,
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Save failed");
      toast.success("Member saved");
      setIsModalOpen(false);
      await loadMembers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m) => {
    if (!confirm(`Delete member "${m.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/committee-members/${m.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      toast.success("Deleted");
      await loadMembers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Committee Members</h1>
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
              New Member
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
            {members.map((m) => (
              <div key={m.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{m.name}</div>
                    <div className="text-xs text-gray-600 truncate">
                      {[m.position, m.specialty].filter(Boolean).join(" • ")}
                    </div>
                  </div>
                </div>
                {m.role && <div className="mt-2 text-sm text-gray-600 line-clamp-2">{m.role}</div>}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center gap-1"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => remove(m)}
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

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Edit Member" : "New Member"} size="lg">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2 border rounded bg-white"
                placeholder="Chairperson, Member, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <input
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className="w-full px-3 py-2 border rounded bg-white"
                placeholder="Orthodontics, Endodontics, etc."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role / Bio</label>
            <textarea
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-white h-24"
              placeholder="Brief role or bio"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm({
                    ...form,
                    photo_file: file,
                    photo_preview: file ? URL.createObjectURL(file) : form.photo_preview,
                  });
                }}
                className="w-full"
              />
              {(form.photo_preview || form.photo_url) && (
                <div className="mt-2">
                  <img
                    src={form.photo_preview || form.photo_url}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                </div>
              )}
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


