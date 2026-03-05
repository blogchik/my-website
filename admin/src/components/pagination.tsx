interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="text-sm text-white/60 hover:text-orange disabled:text-white/20 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        prev_
      </button>
      <span className="text-sm text-white/40">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="text-sm text-white/60 hover:text-orange disabled:text-white/20 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        next_
      </button>
    </div>
  );
}
