"use client";

import MainLayout from "@/components/MainLayout";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Users, Mail } from "lucide-react";

export default function CommitteeDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const [committee, setCommittee] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/committees/${slug}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Failed to load committee");
          setCommittee(null);
          setPages([]);
          return;
        }
        setCommittee(data.committee || null);
        setPages(data.pages || []);
      } catch (e) {
        setError("Failed to load committee");
        setCommittee(null);
        setPages([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const title = committee?.hero_title || committee?.name || "Committee";
  const subtitle =
    committee?.hero_subtitle ||
    committee?.description ||
    "This committee supports the Bahrain Dental Society through specialized roles and initiatives.";

  return (
    <MainLayout>
      {loading && (
        <div className="py-32 flex items-center justify-center text-gray-500">
          Loading committee...
        </div>
      )}

      {!loading && error && (
        <div className="py-32 flex flex-col items-center justify-center text-center px-4">
          <div className="text-2xl font-semibold text-gray-900 mb-2">Committee not found</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <a
            href="/committees"
            className="inline-flex items-center px-4 py-2 rounded-full bg-[#03215F] text-white text-sm font-medium hover:bg-[#021642] transition"
          >
            Back to committees
          </a>
        </div>
      )}

      {!loading && !error && committee && (
        <>
          {/* Hero Section with optional banner image */}
          <div
            className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20 bg-cover bg-center bg-no-repeat"
            style={
              committee?.banner_image
                ? {
                    backgroundImage: `linear-gradient(to right, rgba(3, 33, 95, 0.9), rgba(3, 33, 95, 0.85)), url(${committee.banner_image})`,
                  }
                : undefined
            }
          >
            <div className="container mx-auto px-4">
              <div className="max-w-4xl">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">BDS Committee</span>
                </div>
                <h1 className="text-5xl font-bold mb-6">{title}</h1>
                <p className="text-xl opacity-90 mb-8">{subtitle}</p>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-16 space-y-12">
            {/* Sections from committee_pages */}
            {pages.length > 0 && (
              <div className="space-y-8">
                {pages.map((p) => {
                  const hasImage = !!p.image_url;
                  const alignment = p.image_alignment || "left";
                  const hasUrl = typeof p.button_url === "string" && p.button_url.trim() !== "";
                  const hasLabel = typeof p.button_label === "string" && p.button_label.trim() !== "";
                  const showButton = hasUrl;
                  const buttonLabel = hasLabel ? p.button_label.trim() : "Learn more";

                  if (hasImage && alignment === "full") {
                    return (
                      <div key={p.id} className="bg-white rounded-2xl shadow overflow-hidden">
                        <div className="w-full h-64 md:h-80 overflow-hidden">
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-6 md:p-8 space-y-4">
                          <h3 className="text-2xl font-bold text-gray-900">{p.title}</h3>
                          <div
                            className="committee-content max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: p.content || "" }}
                          />
                          {showButton && (
                            <a
                              href={p.button_url?.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#03215F] text-white text-sm font-medium hover:bg-[#021642] transition"
                            >
                              {buttonLabel}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl shadow overflow-hidden flex flex-col md:flex-row"
                    >
                      {hasImage && alignment === "left" && (
                        <div className="md:w-5/12 h-56 md:h-auto overflow-hidden">
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 p-6 md:p-8 space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900">{p.title}</h3>
                        <div
                          className="committee-content max-w-none text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: p.content || "" }}
                        />
                        {showButton && (
                          <a
                            href={p.button_url?.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#03215F] text-white text-sm font-medium hover:bg-[#021642] transition"
                          >
                            {buttonLabel}
                          </a>
                        )}
                      </div>

                      {hasImage && alignment === "right" && (
                        <div className="md:w-5/12 h-56 md:h-auto overflow-hidden order-first md:order-none md:order-last">
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}


            {/* Contact */}
            {committee?.contact_email && (
              <div className="bg-white rounded-xl p-6 shadow flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">Contact</div>
                  <div className="text-sm text-gray-600">
                    Reach out to the committee
                  </div>
                </div>
                <a
                  href={`mailto:${committee.contact_email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#03215F] text-white"
                >
                  <Mail className="w-4 h-4" />
                  {committee.contact_email}
                </a>
              </div>
            )}

            {!pages.length && !committee?.contact_email && (
              <div className="text-center text-gray-600">Content coming soon.</div>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
}
