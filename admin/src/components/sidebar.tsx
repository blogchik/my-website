"use client";

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
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-navy/10 flex flex-col z-40">
      <div className="p-5 border-b border-navy/10">
        <Link href="/dashboard" className="text-sm font-bold tracking-wider">
          <span className="text-orange">admin</span>
          <span className="text-navy/60">_panel</span>
        </Link>
      </div>

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
  );
}
