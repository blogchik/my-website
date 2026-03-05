export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded bg-white/5 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-white/10 p-6 space-y-4 animate-pulse">
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="h-8 w-32 rounded bg-white/5" />
    </div>
  );
}
