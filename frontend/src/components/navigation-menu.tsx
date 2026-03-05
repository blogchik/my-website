"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoSymbol } from "@/components/icons/logo-symbol";
import { ArrowRightUpIcon } from "@/components/icons/arrow-right-up";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

interface NavigationMenuProps {
  open: boolean;
  onClose: () => void;
}

export function NavigationMenu({ open, onClose }: NavigationMenuProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Manage body overflow and entrance animations
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => {
      setVisible(true);
      const t = setTimeout(() => setAnimateItems(true), 200);
      timersRef.current.push(t);
    });

    return () => {
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setAnimateItems(false);
      setVisible(false);
    };
  }, [open]);

  function handleClose() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setAnimateItems(false);
    const t1 = setTimeout(() => {
      setVisible(false);
      const t2 = setTimeout(onClose, 300);
      timersRef.current.push(t2);
    }, 100);
    timersRef.current.push(t1);
  }

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white flex flex-col transition-all duration-500 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-6 lg:px-16 py-6">
        <div
          className={`transition-all duration-500 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2 text-lg font-bold text-navy tracking-tight">
            <LogoSymbol width={16} height={16} className="text-navy" />
            <span>J. Abduroziq</span>
          </div>
        </div>

        <button
          onClick={handleClose}
          aria-label="Close menu"
          className={`w-8 h-8 flex items-center justify-center cursor-pointer group transition-all duration-500 delay-100 ${
            visible ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
          }`}
        >
          <div className="relative w-6 h-6">
            <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-navy rotate-45 group-hover:bg-orange transition-colors" />
            <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-navy -rotate-45 group-hover:bg-orange transition-colors" />
          </div>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col justify-center px-6 lg:px-16 gap-2">
        {navLinks.map((link, i) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleClose}
              className={`group flex items-center justify-between py-4 border-b border-navy/5 transition-all duration-500 ${
                animateItems
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
              style={{ transitionDelay: `${i * 80 + 200}ms` }}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs text-navy/30 font-medium">
                  0{i + 1}
                </span>
                <span
                  className={`text-4xl md:text-6xl font-bold transition-colors duration-300 ${
                    isActive
                      ? "text-orange"
                      : "text-navy group-hover:text-orange"
                  }`}
                >
                  {link.label}
                </span>
              </div>
              <ArrowRightUpIcon
                width={24}
                height={24}
                className="text-navy/20 group-hover:text-orange group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
              />
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={`px-6 lg:px-16 py-6 text-sm text-navy/40 transition-all duration-500 delay-700 ${
          animateItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        Think Beyond Limits.
      </div>
    </div>
  );
}
