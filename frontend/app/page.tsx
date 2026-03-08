"use client"

import { motion } from "motion/react"
import { AboutCard } from "@/components/about-card"
import { BottomDock } from "@/components/bottom-dock"

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center px-8">
      {/* Menu — desktop only */}
      <motion.button
        type="button"
        className="fixed top-9 right-9 z-10 hidden h-[34px] items-center gap-2 rounded-lg border border-border px-2.5 text-sm text-foreground transition-colors hover:text-primary sm:flex"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        Menu
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
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </motion.button>

      <AboutCard />
      <BottomDock />
    </main>
  )
}
