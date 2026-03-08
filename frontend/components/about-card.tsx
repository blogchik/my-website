"use client"

import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { Fragment, useState } from "react"
import { useSound } from "@/components/sound-provider"

const socials = [
  { label: "Email", href: "mailto:hello@abduroziq.uz" },
  { label: "Instagram", href: "https://instagram.com/jabborov.abduroziq" },
  { label: "GitHub", href: "https://github.com/blogchik" },
  { label: "LinkedIn", href: "https://linkedin.com/in/jabborovabduroziq" },
]

const ease = [0.25, 0.1, 0.25, 1] as const

export function AboutCard() {
  const [avatarOpen, setAvatarOpen] = useState(false)
  const { playClick } = useSound()

  return (
    <section className="w-full max-w-[400px]">
      {/* Avatar lightbox */}
      <AnimatePresence>
        {avatarOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { playClick(); setAvatarOpen(false) }}
            onKeyDown={(e) => e.key === "Escape" && setAvatarOpen(false)}
            role="button"
            tabIndex={0}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25, ease }}
            >
              <Image
                src="/avatar.jpg"
                alt="Jabborov Abduroziq"
                width={320}
                height={320}
                className="rounded-2xl object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <motion.button
          type="button"
          onClick={() => { playClick(); setAvatarOpen(true) }}
          className="h-[43px] w-[43px] shrink-0 cursor-pointer overflow-hidden rounded-full bg-muted"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Image
            src="/avatar.jpg"
            alt="Jabborov Abduroziq"
            width={43}
            height={43}
            className="h-full w-full object-cover"
            priority
          />
        </motion.button>
        <div>
          <h1 className="text-m font-medium text-foreground">
            Jabborov Abduroziq
          </h1>
          <p className="text-xs text-muted-foreground">Think beyond limits.</p>
        </div>
      </motion.div>

      {/* Bio */}
      <motion.div
        className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease }}
      >
        <p>
          Hi, I&apos;m Abduroziq — a{" "}
          <strong className="font-semibold text-foreground">developer</strong>{" "}
          and{" "}
          <strong className="font-semibold text-foreground">designer</strong>{" "}
          passionate about building meaningful digital experiences.
        </p>
        <p>
          I believe in thinking beyond limits and pushing the boundaries of
          what&apos;s possible on the web. My work focuses on creating clean,
          performant, and accessible applications.
        </p>
        <p>
          When I&apos;m not coding, you&apos;ll find me exploring new
          technologies, contributing to open-source projects, and sharing
          knowledge with the community.
        </p>
      </motion.div>

      {/* Socials */}
      <motion.div
        className="mt-8 flex items-center gap-2 text-xs uppercase tracking-wider"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease }}
      >
        {socials.map((social, i) => (
          <Fragment key={social.label}>
            {i > 0 && <span className="font-bold text-primary">/</span>}
            <motion.span whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Link
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground transition-colors hover:text-primary"
              >
                {social.label}
              </Link>
            </motion.span>
          </Fragment>
        ))}
      </motion.div>
    </section>
  )
}
