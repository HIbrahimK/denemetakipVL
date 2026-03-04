"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  School,
  Users,
  Ticket,
  CheckSquare,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { API_URL } from "@/lib/auth";

const sidebarLinks = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/super-admin/okullar", label: "Okullar", icon: School },
  { href: "/super-admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/super-admin/ticketler", label: "Ticketler", icon: Ticket },
  { href: "/super-admin/yapilacaklar", label: "Yapılacaklar", icon: CheckSquare },
  { href: "/super-admin/blog", label: "Blog Yönetimi", icon: FileText },
  { href: "/super-admin/ayarlar", label: "Ayarlar", icon: Settings },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore fetch errors — we clear the cookie anyway
    }
    router.push("/giris");
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/super-admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="font-bold text-sm">S</span>
            </div>
            <span className="font-bold">Super Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive(link.href, link.exact)
                    ? "bg-primary text-white"
                    : "hover:bg-slate-800"
                }
              `}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors w-full text-red-400"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Menü aç"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              Super Admin Paneli
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium shrink-0">
                SA
              </div>
              <span className="text-sm font-medium hidden sm:inline">Super Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
