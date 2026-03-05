"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  sent_at: string | null;
  read_at: string | null;
  is_read: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await apiFetch(`/admin/contacts/${params.id}`);
        if (res.ok) {
          setMessage(await res.json());
        } else if (res.status === 404) {
          router.push("/dashboard/contacts");
        }
      } catch {
        // Handled by apiFetch
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [params.id, router]);

  const toggleRead = async () => {
    if (!message || toggling) return;
    setToggling(true);
    try {
      const res = await apiFetch(`/admin/contacts/${message.id}`, {
        method: "PATCH",
        body: JSON.stringify({ read: !message.is_read }),
      });
      if (res.ok) {
        setMessage(await res.json());
      }
    } catch {
      // Handled by apiFetch
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-3 h-3 bg-orange rounded-full animate-pulse" />
      </div>
    );
  }

  if (!message) return null;

  return (
    <div className="max-w-2xl space-y-6 animate-slide-right">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard/contacts")}
        className="text-sm text-white/30 hover:text-orange transition-colors cursor-pointer"
      >
        &larr; back to contacts
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold">{message.name}</h1>
          <a
            href={`mailto:${message.email}`}
            className="text-sm text-orange hover:underline"
          >
            {message.email}
          </a>
        </div>
        <StatusBadge variant={message.is_read ? "read" : "unread"} />
      </div>

      {/* Metadata */}
      <div className="flex gap-6 text-xs text-white/30">
        <span>received: {formatDate(message.created_at)}</span>
        {message.sent_at && (
          <span>email sent: {formatDate(message.sent_at)}</span>
        )}
        {message.read_at && (
          <span>read: {formatDate(message.read_at)}</span>
        )}
      </div>

      {/* Message body */}
      <div className="rounded-lg border border-white/10 p-6 bg-white/[0.02]">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/80">
          {message.message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={toggleRead}
          disabled={toggling}
          className="px-5 py-2 text-sm rounded-lg border border-orange/30 text-orange hover:bg-orange/10 transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          {toggling
            ? "..."
            : message.is_read
              ? "mark as unread_"
              : "mark as read_"}
        </button>
        <a
          href={`mailto:${message.email}`}
          className="px-5 py-2 text-sm rounded-lg border border-white/10 text-white/60 hover:border-white/20 hover:text-white transition-all duration-200"
        >
          reply via email_
        </a>
      </div>
    </div>
  );
}
