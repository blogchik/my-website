"use client";

import { use } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

const authCheck = typeof window !== "undefined"
  ? Promise.resolve(!!sessionStorage.getItem("admin_access_token"))
  : Promise.resolve(false);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = use(authCheck);

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}
