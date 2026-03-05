"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "~" },
  { href: "/dashboard/contacts", label: "Contacts", icon: ">" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      await apiFetch("/admin/auth/logout", { method: "POST" });
    } catch {
      // Logout even if the request fails
    }
    clearAccessToken();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-navy/10 flex items-center px-4 z-50 md:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 -ml-2 text-navy/60 hover:text-orange transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            {open ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </>
            ) : (
              <>
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </>
            )}
          </svg>
        </button>
        <Link href="/dashboard" className="text-sm font-bold tracking-wider ml-3">
          <span className="text-orange">admin</span>
          <span className="text-navy/60">_panel</span>
        </Link>
      </div>

      {/* Overlay (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 bg-navy/20 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-56 bg-white border-r border-navy/10 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-navy/10 hidden md:block">
          <Link href="/dashboard" className="text-sm font-bold tracking-wider">
            <span className="text-orange">admin</span>
            <span className="text-navy/60">_panel</span>
          </Link>
        </div>

        {/* Spacer for mobile header */}
        <div className="h-14 md:hidden shrink-0" />

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? "text-orange border-l-2 border-orange bg-navy/5"
                    : "text-navy/60 border-l-2 border-transparent hover:text-navy hover:bg-navy/[0.02]"
                }`}
              >
                <span className="font-bold">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy/10">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-navy/40 hover:text-orange transition-colors duration-200 cursor-pointer"
          >
            logout_
          </button>
        </div>
      </aside>
    </>
  );
}
