"use client"

import { motion } from "motion/react"
import Link from "next/link"

const ease = [0.25, 0.1, 0.25, 1] as const

export function NotFoundContent() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="relative select-none">
        <motion.h1
          className="text-[10rem] leading-none font-bold tracking-tighter text-foreground/5 sm:text-[14rem]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease }}
        >
          404
        </motion.h1>
        <motion.p
          className="absolute inset-0 flex items-center justify-center text-lg font-medium text-muted-foreground"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
        >
          Page not found
        </motion.p>
      </div>

      <motion.p
        className="mt-4 max-w-sm text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease }}
      >
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link
            href="/"
            className="mt-8 inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm text-foreground transition-colors hover:text-primary"
          >
            ← Back to home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
