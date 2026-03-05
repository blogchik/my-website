"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Pagination } from "@/components/pagination";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.set("search", search);
      if (unreadOnly) params.set("unread_only", "true");

      const res = await apiFetch(`/admin/contacts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.items);
        setTotal(data.total);
      }
    } catch {
      // Handled by apiFetch
    } finally {
      setLoading(false);
    }
  }, [page, search, unreadOnly]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="text-lg font-bold">Contacts</h1>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 max-w-sm bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-orange/50 transition-colors"
        />
        <button
          onClick={() => {
            setUnreadOnly(!unreadOnly);
            setPage(1);
          }}
          className={`text-xs px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer ${
            unreadOnly
              ? "border-orange/50 text-orange bg-orange/10"
              : "border-white/10 text-white/40 hover:border-white/20"
          }`}
        >
          unread only
        </button>
      </div>

      {/* Total count */}
      <p className="text-xs text-white/30">
        {total} message{total !== 1 ? "s" : ""}
        {search ? ` matching "${search}"` : ""}
      </p>

      {/* Messages list */}
      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-white/20 text-sm">
          {search ? "no messages match your search" : "no messages yet"}
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <Link
              key={msg.id}
              href={`/dashboard/contacts/${msg.id}`}
              className="block animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-white/20 ${
                  msg.is_read
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-l-2 border-l-orange border-t border-r border-b border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{msg.name}</span>
                    <span className="text-xs text-white/20">{msg.email}</span>
                    {!msg.is_read && <StatusBadge variant="unread" />}
                  </div>
                  <p className="text-xs text-white/30 truncate mt-1">
                    {msg.message.slice(0, 120)}
                    {msg.message.length > 120 ? "..." : ""}
                  </p>
                </div>
                <span className="text-xs text-white/20 shrink-0">
                  {formatDate(msg.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
