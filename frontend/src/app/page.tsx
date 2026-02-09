"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, GraduationCap, Users, ShieldCheck, BarChart2, School } from "lucide-react";
import Link from "next/link";
import SchoolLogo from "@/components/school-logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex flex-col transition-colors duration-300 overflow-hidden relative font-sans">

      {/* Modern Background Gradient Mesh */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/20"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] dark:bg-emerald-500/20"></div>
      </div>

      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between">
        <SchoolLogo className="h-10 w-10" nameClassName="text-2xl font-bold text-slate-900 dark:text-white tracking-tight" />
        <div className="flex items-center gap-4">
          <Link href="#" className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">Hakkında</Link>
          <Link href="#" className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">İletişim</Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-8 py-12">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Yeni Nesil Okul Yönetim Sistemi
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-100">
            Öğrenci Başarısını <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Akıllıca Yönetin
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-200">
            Deneme sınavlarını planlayın, sonuçları analiz edin ve öğrenci gelişimini detaylı grafiklerle takip edin. Hepsi tek bir modern panelde.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both delay-300">
          {/* School Login Card */}
          <Link href="/login/school" className="group">
            <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 flex flex-col h-full items-start">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kurum Girişi</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">
                  Okul yöneticileri ve öğretmenler için yönetim paneli.
                </p>
                <div className="flex items-center font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-2 transition-transform">
                  Giriş Yap <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Student Login Card */}
          <Link href="/login/student" className="group">
            <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-900/20 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 flex flex-col h-full items-start">
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-2xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Öğrenci Girişi</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">
                  Sınav sonuçlarını, karneni ve gelişim raporlarını görüntüle.
                </p>
                <div className="flex items-center font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-2 transition-transform">
                  Giriş Yap <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Parent Login Card */}
          <Link href="/login/parent" className="group">
            <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 flex flex-col h-full items-start">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-2xl mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 text-amber-600 dark:text-amber-400">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Veli Girişi</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">
                  Çocuğunuzun akademik durumunu ve deneme analizlerini takip edin.
                </p>
                <div className="flex items-center font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-2 transition-transform">
                  Giriş Yap <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-20 w-full max-w-4xl mx-auto opacity-60">
          <div className="flex items-center justify-center gap-8 md:gap-16 grayscale">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-400">
              <School className="h-6 w-6" /> MEB
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-slate-400">
              <BarChart2 className="h-6 w-6" /> E-Okul
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-slate-400">
              <ShieldCheck className="h-6 w-6" /> ÖSYM
            </div>
          </div>
        </div>

      </main>

      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          &copy; 2026 Deneme Takip Sistemi. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  )
}
