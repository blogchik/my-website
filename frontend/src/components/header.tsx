"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LogoSymbol } from "@/components/icons/logo-symbol";
import { AddCircleIcon } from "@/components/icons/add-circle";
import { NavigationMenu } from "@/components/navigation-menu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("header-scrolled", window.scrollY > 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-6 lg:px-16 py-6 transition-all duration-300">
        <Link href="/" className="block group animate-fade-in">
          <div className="flex items-center gap-2 text-lg font-bold text-navy tracking-tight">
            <LogoSymbol
              width={16}
              height={16}
              className="text-navy"
            />
            <span className="group-hover:text-orange transition-colors duration-300">
              J. Abduroziq
            </span>
          </div>
          <div className="text-sm text-navy/70 mt-0.5 group-hover:text-navy/50 transition-colors duration-300">
            Think Beyond Limits.
          </div>
        </Link>

        <div className="flex flex-col gap-2 items-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="text-navy hover:text-orange hover:rotate-90 transition-all duration-300 cursor-pointer"
          >
            <AddCircleIcon width={32} height={32} />
          </button>
        </div>
      </header>

      <NavigationMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
