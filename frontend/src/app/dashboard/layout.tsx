"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearUserData } from "@/lib/auth";
import { useSchool } from "@/contexts/school-context";
import {
    BarChart2,
    BookOpen,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    Settings,
    Users,
    FileSpreadsheet,
    Search,
    School,
    X,
    Bell,
    UserCircle,
    CalendarDays,
    BookOpenCheck,
    Target,
    UsersRound,
    Award
} from "lucide-react";
import { API_BASE_URL } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { GlobalSearch } from "@/components/global-search";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const { schoolName, schoolLogo } = useSchool();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const auth = localStorage.getItem("auth");
            if (!auth) return;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    credentials: 'include',
                    signal: controller.signal,
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                    // Update localStorage with fresh data
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            } catch (error: any) {
                console.error("Error fetching user profile:", error);
            } finally {
                clearTimeout(timeoutId);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            
            // Set up SSE for real-time notifications
            const eventSource = new EventSource(
                `${API_BASE_URL}/messages/stream`,
                { withCredentials: true }
            );

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setUnreadCount(data.count);
            };

            eventSource.onerror = () => {
                eventSource.close();
                // Fallback to polling
                const interval = setInterval(fetchUnreadCount, 30000);
                return () => clearInterval(interval);
            };

            return () => {
                eventSource.close();
            };
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/messages/unread-count`,
                {
                    credentials: 'include',
                }
            );

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    // Dynamic menu based on role
    const getMenuItems = () => {
        if (!user) return [];
        
        const { role } = user;

        // Student menu - only results
        if (role === 'STUDENT') {
            return [
                { name: "SonuÃ§larÄ±m", href: "/dashboard/student/results", icon: BarChart2 },
                { name: "Deneme Takvimi", href: "/dashboard/student-calendar", icon: CalendarDays },
                { name: "Ã‡alÄ±ÅŸma PlanlarÄ±m", href: "/dashboard/my-tasks", icon: BookOpenCheck },
                { name: "BaÅŸarÄ±larÄ±m", href: "/dashboard/achievements", icon: Award },
                { name: "Grup Ã‡alÄ±ÅŸmalarÄ±m", href: "/dashboard/groups", icon: UsersRound },
                { name: "Mesajlar", href: "/dashboard/messages", icon: MessageSquare },
                { name: "Profilim", href: "/dashboard/profile", icon: UserCircle },
            ];
        }

        // Parent menu - only child results
        if (role === 'PARENT') {
            return [
                { name: "Ã‡ocuÄŸumun SonuÃ§larÄ±", href: "/dashboard/parent/results", icon: BarChart2 },
                { name: "Mesajlar", href: "/dashboard/messages", icon: MessageSquare },
                { name: "Profilim", href: "/dashboard/profile", icon: UserCircle },
            ];
        }

        // Teacher menu - limited access (no users, no settings)
        if (role === 'TEACHER') {
            return [
                { name: "Genel BakÄ±ÅŸ", href: "/dashboard", icon: LayoutDashboard },
                { name: "SÄ±navlar", href: "/dashboard/exams", icon: BookOpen },
                { name: "Deneme Takvimi", href: "/dashboard/exams/calendar", icon: CalendarDays },
                { name: "Ã–ÄŸrenciler", href: "/dashboard/students", icon: GraduationCap },
                { name: "Ã‡alÄ±ÅŸma PlanlarÄ±", href: "/dashboard/study-plans", icon: BookOpenCheck },
                { name: "Mentor GruplarÄ±", href: "/dashboard/groups", icon: UsersRound },
                { name: "Raporlar", href: "/dashboard/reports", icon: FileSpreadsheet },
                { name: "Mesajlar", href: "/dashboard/messages", icon: MessageSquare },
                { name: "Profilim", href: "/dashboard/profile", icon: UserCircle },
            ];
        }

        // Admin menu - full access
        return [
            { name: "Genel BakÄ±ÅŸ", href: "/dashboard", icon: LayoutDashboard },
            { name: "SÄ±navlar", href: "/dashboard/exams", icon: BookOpen },
            { name: "Deneme Takvimi", href: "/dashboard/exams/calendar", icon: CalendarDays },
            { name: "Ã–ÄŸrenciler", href: "/dashboard/students", icon: GraduationCap },
            { name: "SÄ±nÄ±flar", href: "/dashboard/classes", icon: School },
            { name: "Ã‡alÄ±ÅŸma PlanlarÄ±", href: "/dashboard/study-plans", icon: BookOpenCheck },
            { name: "Mentor GruplarÄ±", href: "/dashboard/groups", icon: UsersRound },
            { name: "BaÅŸarÄ±lar", href: "/dashboard/admin/achievements", icon: Award },
            { name: "Raporlar", href: "/dashboard/reports", icon: FileSpreadsheet },
            { name: "Mesajlar", href: "/dashboard/messages", icon: MessageSquare },
            { name: "KullanÄ±cÄ±lar", href: "/dashboard/users", icon: Users },
            { name: "Ayarlar", href: "/dashboard/settings", icon: Settings },
        ];
    };

    const menuItems = getMenuItems();

    const activeMenuHref = useMemo(() => {
        if (!pathname) return "";

        const matches = menuItems
            .map((item) => item.href)
            .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
            .sort((a, b) => b.length - a.length);

        return matches[0] ?? "";
    }, [menuItems, pathname]);

    const getRoleLabel = () => {
        if (!user) return "";
        
        // Ã–ÄŸretmen iÃ§in branÅŸ kontrolÃ¼
        if (user.role === "TEACHER") {
            return user.branch ? `${user.branch} Ã–ÄŸretmeni` : "Ã–ÄŸretmen";
        }
        
        const roleLabels: Record<string, string> = {
            SCHOOL_ADMIN: "Okul YÃ¶neticisi",
            STUDENT: "Ã–ÄŸrenci",
            PARENT: "Veli",
            SUPER_ADMIN: "SÃ¼per Admin"
        };
        return roleLabels[user.role] || user.role;
    };

    const getAvatarUrl = () => {
        if (!user) return '';
        
        if (user.avatarSeed) {
            const parts = user.avatarSeed.split(':');
            if (parts.length === 2) {
                return `https://api.dicebear.com/7.x/${parts[0]}/svg?seed=${parts[1]}`;
            }
        }
        
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName || 'User'}`;
    };

    const handleLogout = () => {
        clearUserData();
        window.location.href = '/';
    };

    return (
        <div className="flex h-screen bg-[#1e1e2d] text-slate-100 overflow-hidden font-sans">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`no-print fixed lg:static top-0 left-0 z-50 h-full w-72 bg-[#1e1e2d] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo Area - Borderless and Clean */}
                <Link href="/dashboard" className="flex items-start gap-3 px-6 py-6 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSidebarOpen(false)}>
                    <div className="flex items-center justify-center overflow-hidden min-w-[48px] max-w-[48px] mt-1">
                        {schoolLogo ? (
                            <img 
                                src={schoolLogo} 
                                alt="Logo" 
                                className="h-12 w-12 object-contain drop-shadow-lg" 
                            />
                        ) : (
                            <img 
                                src="/LOGO.png" 
                                alt="Deneme Takip" 
                                className="h-12 w-12 object-contain drop-shadow-lg" 
                            />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-lg font-bold tracking-tight leading-snug block whitespace-normal break-words">
                            {schoolName}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden ml-auto shrink-0" onClick={(e) => { e.preventDefault(); setSidebarOpen(false); }}>
                        <X className="h-5 w-5" />
                    </Button>
                </Link>

                {/* User Profile (Visual Style) */}
                <Link href="/dashboard/profile" className="px-8 mb-8 text-center hover:opacity-80 transition-opacity cursor-pointer block" onClick={() => setSidebarOpen(false)}>
                    <div className="relative inline-block">
                        <Avatar className="h-20 w-20 border-4 border-[#2b2b40] shadow-xl">
                            <AvatarImage src={getAvatarUrl()} />
                            <AvatarFallback className="bg-indigo-500 text-white text-xl">
                                {user?.firstName?.charAt(0) || "A"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-5 w-5 bg-emerald-500 border-4 border-[#1e1e2d] rounded-full"></div>
                    </div>
                    <h3 className="mt-4 font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-slate-400 text-sm">{getRoleLabel()}</p>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = activeMenuHref === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Ã‡Ä±kÄ±ÅŸ Yap
                    </button>
                </div>
            </aside>

            {/* Main Content Area - Rounded Container */}
            <div className="flex-1 flex flex-col h-full relative lg:py-4 lg:pr-4 overflow-hidden">
                <div className="flex-1 bg-[#F3F4F6] dark:bg-slate-950 text-slate-900 dark:text-slate-50 lg:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">

                    {/* Topbar */}
                    <header className="no-print h-20 px-8 flex items-center justify-between flex-shrink-0 bg-transparent">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(true)}>
                                <Menu className="h-6 w-6" />
                            </Button>
                            {user && user.role !== 'STUDENT' && user.role !== 'PARENT' && (
                                <div className="hidden md:block">
                                    <GlobalSearch />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="relative text-slate-500 hover:bg-white/50 rounded-full"
                                onClick={() => router.push('/dashboard/messages')}
                            >
                                <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-bounce">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Button>
                            <ThemeToggle />
                        </div>
                    </header>

                    {/* Scrollable Page Content */}
                    <main className="flex-1 overflow-y-auto px-8 pb-8 pt-2 scrollbar-hide">
                        {children}
                    </main>

                </div>
            </div>
        </div>
    );
}
