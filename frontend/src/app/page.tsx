"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SchoolLogo from "@/components/school-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSchool } from "@/contexts/school-context";

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { schoolNotFound, isLoading, schoolName, schoolAppName } = useSchool();

  useEffect(() => {
    const token = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("token="));

    if (token) {
      try {
        const value = token.split("=").slice(1).join("=");
        const payload = value.split(".")[1];
        const decoded = JSON.parse(atob(payload));

        if (decoded.role === "STUDENT") {
          router.replace("/dashboard/student/results");
        } else if (decoded.role === "PARENT") {
          router.replace("/dashboard/parent/students");
        } else {
          router.replace("/dashboard");
        }
        return;
      } catch {
        // Invalid token — show homepage
      }
    }
    setChecked(true);
  }, [router]);

  if (!checked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Unregistered subdomain → show "school not found" with demo request link
  if (schoolNotFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-[#0f172a] dark:via-[#0f172a] dark:to-[#1e1b4b]">
        <header className="w-full flex items-center justify-end px-6 py-4">
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Okul Bulunamadı
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Bu adres ile eşleşen kayıtlı bir okul bulunamadı. 
              Okulunuz için bir hesap oluşturmak isterseniz demo talep edebilirsiniz.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://2eh.net"
                className="inline-flex items-center justify-center py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all"
              >
                Ana Sayfaya Git
              </a>
              <a
                href="https://2eh.net/#iletisim"
                className="inline-flex items-center justify-center py-3 px-6 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-all"
              >
                Demo Talep Et
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f172a] overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 dark:bg-amber-500/3 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full flex items-center justify-between px-6 py-5">
        <SchoolLogo className="h-10 w-10" showName={true} nameClassName="text-lg font-bold text-slate-900 dark:text-white ml-1" />
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Aktif Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                {schoolAppName || "Deneme Takip"}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400">
                  Sistemine
                </span>{" "}
                Hoş Geldiniz
              </h1>

              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Sınav analizleri, konu takibi ve detaylı performans raporlarıyla
                hedefinize bir adım daha yaklaşın.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {[
                  { icon: "📊", text: "Detaylı Analizler" },
                  { icon: "📈", text: "Performans Takibi" },
                  { icon: "🎯", text: "Hedef Planlama" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-sm">
                    <span>{f.icon}</span>
                    <span className="text-slate-600 dark:text-slate-300">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Login Cards */}
            <div className="space-y-4">
              {/* Admin/Teacher Login */}
              <Link href="/login/school" className="group block">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e1e2d] to-[#2d2d44] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <svg className="h-7 w-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white">Yönetici / Öğretmen</h3>
                      <p className="text-sm text-slate-400">E-posta ve şifre ile giriş yapın</p>
                    </div>
                    <svg className="h-5 w-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>

              {/* Student Login */}
              <Link href="/login/student" className="group block">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white">Öğrenci Girişi</h3>
                      <p className="text-sm text-emerald-100">Öğrenci numarası ile giriş yapın</p>
                    </div>
                    <svg className="h-5 w-5 text-emerald-300 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>

              {/* Parent Login */}
              <Link href="/login/parent" className="group block">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white">Veli Girişi</h3>
                      <p className="text-sm text-amber-100">TC kimlik numarası ile giriş yapın</p>
                    </div>
                    <svg className="h-5 w-5 text-amber-300 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">24+</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ders Analizi</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">%100</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Güvenli</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">7/24</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Erişim</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-600">
          © {new Date().getFullYear()} {schoolName || "Deneme Takip"} — Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}
