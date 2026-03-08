"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

interface SoundContextValue {
  enabled: boolean
  toggle: () => void
  playClick: () => void
}

const SoundContext = createContext<SoundContextValue>({
  enabled: true,
  toggle: () => {},
  playClick: () => {},
})

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio("/sounds/click.wav")
    audioRef.current.volume = 0.3
  }, [])

  const toggle = useCallback(() => setEnabled((prev) => !prev), [])

  const playClick = useCallback(() => {
    if (!enabled || !audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }, [enabled])

  return (
    <SoundContext.Provider value={{ enabled, toggle, playClick }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  return useContext(SoundContext)
}
