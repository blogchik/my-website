"use client"

import { useState } from "react"
import { Menu01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import { AboutCard } from "@/components/about-card"
import { BottomDock } from "@/components/bottom-dock"
import { CommandPalette } from "@/components/command-palette"
import { useSound } from "@/components/sound-provider"

export default function Page() {
  const { playClick } = useSound()
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <main className="flex min-h-svh items-center justify-center px-8">
      {/* Menu — desktop only */}
      <motion.button
        type="button"
        className="fixed top-9 right-9 z-10 hidden h-[34px] items-center gap-2 rounded-lg border border-border px-2.5 text-sm text-foreground transition-colors hover:text-primary sm:flex"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={playClick}
        whileHover="hover"
        whileTap="tap"
      >
        Menu
        <motion.span
          className="flex"
          variants={{
            hover: { rotate: 90 },
            tap: { scale: 0.85 },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={2} />
        </motion.span>
      </motion.button>

      <AboutCard />
      <BottomDock onSearchClick={() => setCommandOpen(true)} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </main>
  )
}
