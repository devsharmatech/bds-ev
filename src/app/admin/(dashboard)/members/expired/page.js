"use client";

import React, { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function ExpiredMembersPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [downgradingId, setDowngradingId] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    const fetchExpired = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(perPage),
        });

        const res = await fetch(`/api/admin/members/expired?${params.toString()}`);
        const json = await res.json();
        if (!json.success) {
          toast.error(json.error || "Failed to load expired members");
          setMembers([]);
          setTotal(0);
        } else {
          setMembers(json.data || []);
          setTotal(json.meta?.total || (json.data ? json.data.length : 0));
        }
      } catch (err) {
        console.error("Error loading expired members", err);
        toast.error("Network error while loading expired members");
      } finally {
        setLoading(false);
      }
    };

    fetchExpired();
  }, [page, perPage]);

  const handleDowngrade = async (memberId) => {
    if (!memberId) return;
    if (!confirm("Downgrade this member to Free and clear expiry date?")) return;

    setDowngradingId(memberId);
    try {
      const res = await fetch("/api/admin/members/expired", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: memberId }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Failed to downgrade member");
      } else {
        toast.success("Member downgraded to Free");
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      }
    } catch (err) {
      console.error("Error downgrading member", err);
      toast.error("Network error while downgrading member");
    } finally {
      setDowngradingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-[#03215F]" />
        <span className="ml-2 text-gray-700">Loading expired members...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expired Members</h1>
          <p className="mt-1 text-sm text-gray-600">
            Members whose membership expiry date is in the past and still marked as paid.
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <AlertTriangle className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-700 font-medium">No expired paid members found.</p>
          <p className="text-gray-500 text-sm mt-1">All active paid members are within their expiry date.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-sm rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email / Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.full_name || "-"}</div>
                    <div className="text-xs text-gray-500">ID: {member.id}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email || "-"}</div>
                    <div className="text-xs text-gray-500">{member.phone || member.mobile || "-"}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {member.membership_code || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {member.membership_expiry_date
                      ? new Date(member.membership_expiry_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Expired
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleDowngrade(member.id)}
                      disabled={downgradingId === member.id}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-[#03215F] hover:bg-[#021642] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downgradingId === member.id ? "Processing..." : "Downgrade to Free"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {members.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            Showing page {page} of {totalPages} ({total} expired members)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
