"use client";

import { useState, useEffect } from "react";
import { Save, X, BookOpen } from "lucide-react";

export function CourseForm({ initial, saving, onCancel, onSubmit }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description || "");
    }
  }, [initial]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name, description });
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="w-full mx-auto">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-gradient-to-br from-[#9cc2ed] to-[#03215F] rounded-2xl shadow-lg">
            <BookOpen className="text-white" size={28} />
          </div>
        </div>

        {/* Form Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {initial ? "Edit Course" : "Create New Course"}
          </h2>
          <p className="text-gray-600">
            {initial ? "Update your course details" : "Add a new course to your catalog"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Course Name <span className="text-[#b8352d]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter course name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#9cc2ed] focus:border-transparent transition-all duration-200 shadow-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <div className="relative">
              <textarea
                placeholder="Describe what students will learn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#9cc2ed] focus:border-transparent transition-all duration-200 shadow-sm resize-none"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {description.length}/500
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] hover:from-[#03215F] hover:to-[#03215F] text-white rounded-xl shadow-sm hover:shadow transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#03215F] disabled:hover:to-[#03215F]"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {initial ? "Update" : "Create"} Course
                </>
              )}
            </button>
          </div>

          {/* Form Tips */}
          <div className="bg-[#9cc2ed] border border-[#9cc2ed] rounded-lg p-3">
            <p className="text-xs text-[#03215F] text-center">
              <strong>Tip:</strong> Make your course name clear and descriptive to help students find what they need.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}