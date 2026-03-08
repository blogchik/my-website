export function BottomDock() {
  return (
    <div className="fixed bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
      {/* Music */}
      <button
        type="button"
        className="flex h-[34px] w-[38px] items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:text-primary"
        aria-label="Music"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      </button>

      {/* Search / Command */}
      <button
        type="button"
        className="flex h-[34px] items-center gap-1.5 rounded-lg border border-border px-2.5 text-foreground transition-colors hover:text-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        {/* Desktop: keyboard shortcuts */}
        <span className="hidden items-center gap-1 sm:flex">
          <kbd className="flex h-5 w-5 items-center justify-center rounded border border-border bg-muted text-[11px]">
            ⌘
          </kbd>
          <kbd className="flex h-5 w-5 items-center justify-center rounded border border-border bg-muted text-[11px]">
            K
          </kbd>
        </span>

        {/* Mobile: Menu text */}
        <span className="text-sm sm:hidden">Menu</span>
      </button>
    </div>
  )
}
