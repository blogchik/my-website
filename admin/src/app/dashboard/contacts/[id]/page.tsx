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

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await apiFetch(`/admin/contacts/${params.id}`);
        if (res.ok) {
          const data: ContactMessage = await res.json();
          setMessage(data);
          if (!data.is_read) {
            apiFetch(`/admin/contacts/${params.id}`, {
              method: "PATCH",
              body: JSON.stringify({ read: true }),
            }).then(async (r) => {
              if (r.ok) setMessage(await r.json());
            });
          }
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
        className="text-sm text-navy/30 hover:text-orange transition-colors cursor-pointer"
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
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-navy/30">
        <span>received: {formatDate(message.created_at)}</span>
        {message.sent_at && (
          <span>email sent: {formatDate(message.sent_at)}</span>
        )}
        {message.read_at && (
          <span>read: {formatDate(message.read_at)}</span>
        )}
      </div>

      {/* Message body */}
      <div className="rounded-lg border border-navy/10 p-6 bg-navy/[0.02]">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-navy/80">
          {message.message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <a
          href={`mailto:${message.email}`}
          className="px-5 py-2 text-sm rounded-lg border border-navy/10 text-navy/60 hover:border-navy/20 hover:text-navy transition-all duration-200"
        >
          reply via email_
        </a>
      </div>
    </div>
  );
}
