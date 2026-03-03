import Link from "next/link";
import {
  LayoutDashboard,
  School,
  Users,
  Ticket,
  CheckSquare,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";

const sidebarLinks = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/okullar", label: "Okullar", icon: School },
  { href: "/super-admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/super-admin/ticketler", label: "Ticketler", icon: Ticket },
  { href: "/super-admin/yapilacaklar", label: "Yapılacaklar", icon: CheckSquare },
  { href: "/super-admin/ayarlar", label: "Ayarlar", icon: Settings },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <Link href="/super-admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="font-bold text-sm">S</span>
            </div>
            <span className="font-bold">Super Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors w-full text-red-400">
            <LogOut className="h-5 w-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold">Super Admin Paneli</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                SA
              </div>
              <span className="text-sm font-medium">Super Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
