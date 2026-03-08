"use client"

import Image from "next/image"
import Link from "next/link"
import { Fragment, useState } from "react"

const socials = [
  { label: "Email", href: "mailto:hello@abduroziq.uz" },
  { label: "Instagram", href: "https://instagram.com/jabborov.abduroziq" },
  { label: "GitHub", href: "https://github.com/blogchik" },
  { label: "LinkedIn", href: "https://linkedin.com/in/jabborovabduroziq" },
]

export function AboutCard() {
  const [avatarOpen, setAvatarOpen] = useState(false)

  return (
    <section className="w-full max-w-[400px]">
      {/* Avatar lightbox */}
      {avatarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setAvatarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setAvatarOpen(false)}
          role="button"
          tabIndex={0}
        >
          <Image
            src="/avatar.jpg"
            alt="Jabborov Abduroziq"
            width={320}
            height={320}
            className="rounded-2xl object-cover"
          />
        </div>
      )}

      {/* Profile */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setAvatarOpen(true)}
          className="h-[43px] w-[43px] shrink-0 cursor-pointer overflow-hidden rounded-full bg-muted transition-opacity hover:opacity-80"
        >
          <Image
            src="/avatar.jpg"
            alt="Jabborov Abduroziq"
            width={43}
            height={43}
            className="h-full w-full object-cover"
            priority
          />
        </button>
        <div>
          <h1 className="text-m font-medium text-foreground">
            Jabborov Abduroziq
          </h1>
          <p className="text-xs text-muted-foreground">Think beyond limits.</p>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
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
      </div>

      {/* Socials */}
      <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-wider">
        {socials.map((social, i) => (
          <Fragment key={social.label}>
            {i > 0 && <span className="font-bold text-primary">/</span>}
            <Link
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground transition-colors hover:text-primary"
            >
              {social.label}
            </Link>
          </Fragment>
        ))}
      </div>
    </section>
  )
}
