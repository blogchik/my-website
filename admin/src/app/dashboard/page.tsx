"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import { CardSkeleton } from "@/components/loading-skeleton";

interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  database: string;
  environment: string;
  message_count: number;
  unread_count: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [healthRes, messagesRes] = await Promise.all([
        apiFetch("/admin/health"),
        apiFetch("/admin/contacts?page=1&page_size=5"),
      ]);

      if (healthRes.ok) setHealth(await healthRes.json());
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        setRecentMessages(data.items);
      }
    } catch {
      // Handled by apiFetch redirect
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const poll = () => {
      if (document.visibilityState !== "hidden") fetchData();
    };

    fetchData();
    const interval = setInterval(poll, 30_000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <h1 className="text-lg font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-navy/10 p-6 animate-scale-in">
          <p className="text-xs text-navy/40 mb-2">system_status</p>
          <div className="flex items-center justify-between">
            <StatusBadge
              variant={
                health?.status === "ok"
                  ? "ok"
                  : health?.status === "degraded"
                    ? "degraded"
                    : "error"
              }
            />
            <span className="text-xs text-navy/30">
              {health ? formatUptime(health.uptime) : "--"}
            </span>
          </div>
          <p className="text-xs text-navy/20 mt-3">
            db: {health?.database ?? "--"} | env: {health?.environment ?? "--"}
          </p>
        </div>

        <div
          className="rounded-lg border border-navy/10 p-6 animate-scale-in"
          style={{ animationDelay: "100ms" }}
        >
          <p className="text-xs text-navy/40 mb-2">total_messages</p>
          <p className="text-3xl font-bold text-navy">
            {health?.message_count ?? 0}
          </p>
        </div>

        <div
          className="rounded-lg border border-navy/10 p-6 animate-scale-in"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-xs text-navy/40 mb-2">unread_messages</p>
          <p className="text-3xl font-bold text-orange">
            {health?.unread_count ?? 0}
          </p>
        </div>
      </div>

      {/* Recent messages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-navy/60">recent_messages</h2>
          <Link
            href="/dashboard/contacts"
            className="text-xs text-navy/30 hover:text-orange transition-colors"
          >
            view all_
          </Link>
        </div>

        {recentMessages.length === 0 ? (
          <div className="text-center py-12 text-navy/20 text-sm">
            no messages yet
          </div>
        ) : (
          <div className="space-y-2">
            {recentMessages.map((msg, i) => (
              <Link
                key={msg.id}
                href={`/dashboard/contacts/${msg.id}`}
                className="block animate-slide-right"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-navy/20 ${
                    msg.is_read
                      ? "border-navy/5 bg-navy/[0.02]"
                      : "border-l-2 border-l-orange border-t border-r border-b border-navy/10 bg-navy/[0.03]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {msg.name}
                      </span>
                      {!msg.is_read && <StatusBadge variant="unread" />}
                    </div>
                    <p className="text-xs text-navy/30 truncate mt-1">
                      {msg.message.slice(0, 80)}
                      {msg.message.length > 80 ? "..." : ""}
                    </p>
                  </div>
                  <span className="text-xs text-navy/20 shrink-0">
                    {formatDate(msg.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
