type BadgeVariant = "ok" | "degraded" | "error" | "read" | "unread";

const variants: Record<BadgeVariant, { dot: string; text: string; label: string }> = {
  ok: { dot: "bg-green-400", text: "text-green-400", label: "operational" },
  degraded: { dot: "bg-amber-400", text: "text-amber-400", label: "degraded" },
  error: { dot: "bg-red-400", text: "text-red-400", label: "error" },
  read: { dot: "bg-white/30", text: "text-white/40", label: "read" },
  unread: { dot: "bg-orange", text: "text-orange", label: "unread" },
};

export function StatusBadge({ variant }: { variant: BadgeVariant }) {
  const { dot, text, label } = variants[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
