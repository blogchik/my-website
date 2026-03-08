"use client"

import {
  Headphones,
  HeadphoneMuteIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "motion/react"
import { useSound } from "@/components/sound-provider"

interface BottomDockProps {
  onSearchClick?: () => void
}

export function BottomDock({ onSearchClick }: BottomDockProps) {
  const { enabled, toggle, playClick } = useSound()

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Sound toggle */}
      <motion.button
        type="button"
        className="flex h-[34px] w-[38px] items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:text-primary"
        aria-label={enabled ? "Disable sound effects" : "Enable sound effects"}
        onClick={toggle}
        whileHover="hover"
        whileTap="tap"
      >
        <motion.span
          className="flex"
          variants={{
            hover: { y: -2 },
            tap: { scale: 0.85 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={enabled ? "on" : "off"}
              className="flex"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              <HugeiconsIcon
                icon={enabled ? Headphones : HeadphoneMuteIcon}
                size={18}
                strokeWidth={2}
              />
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </motion.button>

      {/* Search / Command */}
      <motion.button
        type="button"
        className="flex h-[34px] items-center gap-1.5 rounded-lg border border-border px-2.5 text-foreground transition-colors hover:text-primary"
        onClick={() => {
          playClick()
          onSearchClick?.()
        }}
        whileHover="hover"
        whileTap="tap"
      >
        <motion.span
          className="flex"
          variants={{
            hover: { rotate: -15 },
            tap: { scale: 0.85 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={2} />
        </motion.span>

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
      </motion.button>
    </motion.div>
  )
}
