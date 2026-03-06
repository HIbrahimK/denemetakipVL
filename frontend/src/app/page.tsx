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
  const { schoolNotFound, isLoading } = useSchool();

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-[#0f172a] dark:via-[#0f172a] dark:to-[#1e1b4b]">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4">
        <SchoolLogo className="h-10 w-10" showName={true} nameClassName="text-lg font-bold text-slate-900 dark:text-white ml-3" />
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Hero */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Hoş Geldiniz
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Sınav analizleri, öğrenci takibi ve detaylı raporlar için giriş yapın.
            </p>
          </div>

          {/* Login Buttons */}
          <div className="grid gap-4">
            <Link
              href="/login/school"
              className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Yönetici / Öğretmen Girişi
            </Link>

            <Link
              href="/login/student"
              className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Öğrenci Girişi
            </Link>

            <Link
              href="/login/parent"
              className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg transition-all shadow-lg shadow-amber-200 dark:shadow-amber-900/30 hover:shadow-xl"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Veli Girişi
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-sm text-slate-400 dark:text-slate-600">
        © 2026 Deneme Takip — Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
