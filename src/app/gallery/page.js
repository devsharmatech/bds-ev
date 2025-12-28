"use client";

import { ImageIcon, Clock, X } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [activeImages, setActiveImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.success) setItems(data.galleries || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openViewer = async (item) => {
    setActive(item);
    setActiveImages([]);
    setViewerOpen(true);
    setLoadingImages(true);
    try {
      const res = await fetch(`/api/gallery/${item.id}`);
      const data = await res.json();
      if (data.success) {
        setActiveImages((data.images || []).map((im) => im.image_url));
      }
    } finally {
      setLoadingImages(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#03215F] to-[#AE9B66] bg-clip-text text-transparent">
              Photo Gallery
            </h1>
            <p className="text-gray-600 mt-2">Explore highlights from our events and activities.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-600">
              <Clock className="w-5 h-5 mr-2 animate-pulse" />
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <div className="flex justify-center mb-4">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              No gallery items yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => openViewer(it)}
                  className="group text-left bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="aspect-[16/10] w-full bg-gray-100">
                    {it.featured_image_url ? (
                      <img
                        src={it.featured_image_url}
                        alt={it.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-gray-900">{it.title}</div>
                    <div className="mt-2 flex gap-2 text-xs">
                      {it.tag1 ? <span className="px-2 py-1 bg-gray-100 rounded">{it.tag1}</span> : null}
                      {it.tag2 ? <span className="px-2 py-1 bg-gray-100 rounded">{it.tag2}</span> : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={viewerOpen} onClose={() => setViewerOpen(false)} title={active?.title || "Gallery"} size="xl">
        {loadingImages ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 animate-pulse" />
            Loading images...
          </div>
        ) : activeImages.length === 0 ? (
          <div className="text-sm text-gray-600">No images available.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {activeImages.map((url, idx) => (
              <div key={idx} className="rounded overflow-hidden bg-gray-100">
                <img src={url} className="w-full h-36 object-cover" />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
