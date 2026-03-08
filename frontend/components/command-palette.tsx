"use client"

import { useEffect, useRef, useCallback } from "react"
import {
  QrCodeIcon,
  ImageCropIcon,
  AddCircleHalfDotIcon,
  Home01Icon,
  InformationCircleIcon,
  Store01Icon,
  Folder01Icon,
  Sun01Icon,
  Moon02Icon,
  VolumeHighIcon,
  VolumeMute01Icon,
  LanguageCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "next-themes"
import { useSound } from "@/components/sound-provider"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"

const ease = [0.25, 0.1, 0.25, 1] as const

interface QuickTool {
  label: string
  icon: IconSvgElement
}

interface MenuItem {
  label: string
  icon: IconSvgElement
  shortcut: string[]
}

const quickTools: QuickTool[] = [
  { label: "Generate QR Code", icon: QrCodeIcon },
  { label: "Compress Image", icon: ImageCropIcon },
  { label: "Halftone Effect", icon: AddCircleHalfDotIcon },
]

const menuItems: MenuItem[] = [
  { label: "Home", icon: Home01Icon, shortcut: ["Shift", "H"] },
  { label: "About", icon: InformationCircleIcon, shortcut: ["Shift", "A"] },
  { label: "Shop", icon: Store01Icon, shortcut: ["Shift", "S"] },
  { label: "Projects", icon: Folder01Icon, shortcut: ["Shift", "P"] },
]

const kbdClass = "rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium"

function ShortcutKbd({ keys }: { keys: string[] }) {
  return (
    <CommandShortcut className="flex items-center gap-0.5">
      {keys.map((key) => (
        <kbd key={key} className={kbdClass}>
          {key}
        </kbd>
      ))}
    </CommandShortcut>
  )
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { playClick, enabled: soundEnabled, toggle: toggleSound } = useSound()
  const { resolvedTheme, setTheme } = useTheme()
  const prevOpen = useRef(open)

  const inputRef = useRef<HTMLInputElement>(null)

  const refocusInput = useCallback(() => {
    // cmdk blurs the input asynchronously after onSelect; schedule focus restore
    // after the current microtask queue + next frame to guarantee it sticks.
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  // Play click sound on open
  useEffect(() => {
    if (open && !prevOpen.current) {
      playClick()
    }
    prevOpen.current = open
  }, [open, playClick])

  // Keyboard shortcuts: Ctrl+K / Cmd+K to toggle, Escape to close, Shift+T/M
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === "Escape" && open) {
        e.preventDefault()
        onOpenChange(false)
      }
      if (e.shiftKey && e.key === "T") {
        if (
          e.target instanceof HTMLElement &&
          (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        )
          return
        e.preventDefault()
        toggleTheme()
      }
      if (e.shiftKey && e.key === "M") {
        if (
          e.target instanceof HTMLElement &&
          (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        )
          return
        e.preventDefault()
        toggleSound()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange, toggleTheme, toggleSound])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 supports-backdrop-filter:backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            onClick={() => onOpenChange(false)}
          />

          {/* Content */}
          <motion.div
            className="fixed top-1/3 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 sm:max-w-[420px]"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease }}
          >
            <Command
              className="rounded-xl border border-border bg-background/95 shadow-2xl ring-1 ring-foreground/5 supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-xl"
              loop
            >
              <CommandInput ref={inputRef} placeholder="Search notes, products, tools..." autoFocus />

              <CommandList className="max-h-[320px] p-1">
                <CommandEmpty>No results found.</CommandEmpty>

                {/* Quick Tools */}
                <CommandGroup heading="Quick Tools">
                  {quickTools.map((tool, i) => (
                    <motion.div
                      key={tool.label}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: i * 0.03,
                        ease,
                      }}
                    >
                      <CommandItem>
                        <HugeiconsIcon
                          icon={tool.icon}
                          size={16}
                          strokeWidth={2}
                          className="text-muted-foreground"
                        />
                        <span>{tool.label}</span>
                      </CommandItem>
                    </motion.div>
                  ))}
                </CommandGroup>

                {/* Menu */}
                <CommandGroup heading="Menu">
                  {menuItems.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: quickTools.length * 0.03 + i * 0.03,
                        ease,
                      }}
                    >
                      <CommandItem>
                        <HugeiconsIcon
                          icon={item.icon}
                          size={16}
                          strokeWidth={2}
                          className="text-muted-foreground"
                        />
                        <span>{item.label}</span>
                        <ShortcutKbd keys={item.shortcut} />
                      </CommandItem>
                    </motion.div>
                  ))}
                </CommandGroup>

                {/* Settings */}
                <CommandGroup heading="Settings">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: (quickTools.length + menuItems.length) * 0.03,
                      ease,
                    }}
                  >
                    <CommandItem onSelect={() => { toggleTheme(); refocusInput() }}>
                      <HugeiconsIcon
                        icon={resolvedTheme === "dark" ? Sun01Icon : Moon02Icon}
                        size={16}
                        strokeWidth={2}
                        className="text-muted-foreground"
                      />
                      <span>
                        {resolvedTheme === "dark"
                          ? "Light Mode"
                          : "Dark Mode"}
                      </span>
                      <ShortcutKbd keys={["Shift", "T"]} />
                    </CommandItem>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay:
                        (quickTools.length + menuItems.length) * 0.03 + 0.03,
                      ease,
                    }}
                  >
                    <CommandItem onSelect={() => { toggleSound(); refocusInput() }}>
                      <HugeiconsIcon
                        icon={
                          soundEnabled ? VolumeMute01Icon : VolumeHighIcon
                        }
                        size={16}
                        strokeWidth={2}
                        className="text-muted-foreground"
                      />
                      <span>
                        {soundEnabled ? "Mute Sound" : "Unmute Sound"}
                      </span>
                      <ShortcutKbd keys={["Shift", "M"]} />
                    </CommandItem>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay:
                        (quickTools.length + menuItems.length) * 0.03 + 0.06,
                      ease,
                    }}
                  >
                    <CommandItem>
                      <HugeiconsIcon
                        icon={LanguageCircleIcon}
                        size={16}
                        strokeWidth={2}
                        className="text-muted-foreground"
                      />
                      <span>Language</span>
                      <ShortcutKbd keys={["Shift", "L"]} />
                    </CommandItem>
                  </motion.div>
                </CommandGroup>
              </CommandList>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium">Abduroziq</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    Use Tool
                    <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">
                      ↵
                    </kbd>
                  </span>
                  <span className="flex items-center gap-1">
                    Exit
                    <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">
                      Esc
                    </kbd>
                  </span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
