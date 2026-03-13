"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SchoolLogo from "@/components/school-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSchool } from "@/contexts/school-context";
import { API_BASE_URL } from "@/lib/auth";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

type HomeFeedItem = {
  id: string;
  title: string;
  body: string;
  deeplink?: string | null;
  publishAt: string;
};

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [announcements, setAnnouncements] = useState<HomeFeedItem[]>([]);
  const [updates, setUpdates] = useState<HomeFeedItem[]>([]);
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

  useEffect(() => {
    if (!checked || schoolNotFound) return;

    const loadHomeFeed = async () => {
      try {
        const host = window.location.hostname;
        const response = await fetch(
          `${API_BASE_URL}/notifications/home-feed?host=${encodeURIComponent(host)}&limit=3`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
        setUpdates(Array.isArray(data.updates) ? data.updates : []);
      } catch {
        // Fail silently to keep homepage accessible.
      }
    };

    loadHomeFeed();
  }, [checked, schoolNotFound]);

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
    <div className="min-h-screen flex flex-col bg-[#f3f6fb] dark:bg-[#0f172a] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-48 right-[-8rem] w-[34rem] h-[34rem] rounded-full bg-indigo-500/10 blur-[110px]" />
        <div className="absolute -bottom-48 left-[-8rem] w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <header className="relative z-10 w-full px-4 sm:px-6 lg:px-10 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <SchoolLogo className="h-10 w-10" showName={true} nameClassName="text-lg font-bold text-slate-900 dark:text-white ml-1" />
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span>Akilli Sinav Yonetimi</span>
            <span>Canli Raporlama</span>
            <span>Okul Bazli Guvenlik</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-10 pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <section className="lg:col-span-7 rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              Yeni Nesil Deneme Platformu
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {schoolAppName || "Deneme Takip"} ile
              <span className="block text-indigo-600 dark:text-indigo-400 mt-1">
                olc, analiz et, hizli aksiyon al.
              </span>
            </h1>

            <p className="mt-5 text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Okul yonetimi, ogretmen, ogrenci ve veli rollerini tek yerde birlestiren
              altyapi ile sinav surecini sade ve takip edilebilir hale getirin.
            </p>

            <div className="mt-7 grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-4">
                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Anlik Analiz</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sinav girisi sonrasi raporlar otomatik olusur.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-4">
                <BookOpenCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Calisma Plani</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Konu bazli hedef ve gorev takibi tek panelde.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-4">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Guvenli Yapi</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Okul bazli erisim, loglama ve izolasyon korumasi.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login/school" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1e293b] hover:bg-[#0f172a] text-white text-sm font-semibold transition-colors">
                Kurum Girisi
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login/student" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
                Ogrenci Girisi
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login/parent" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors">
                Veli Girisi
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 text-center">
                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">24+</p>
                <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80">Rapor Karti</p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-center">
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">7/24</p>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-300/80">Panel Erisimi</p>
              </div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 text-center">
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">%100</p>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-300/80">Okul Odakli</p>
              </div>
            </div>
          </section>

          <section className="lg:col-span-5 rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-5 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-black/30 flex flex-col">
            <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Gunluk Operasyon Ozeti</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                  <p className="text-slate-600 dark:text-slate-300">Okul yonetimi ve ogretmen akislari ayni panelde.</p>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-slate-600 dark:text-slate-300">Ogrenci ve veli gorunumleri role gore otomatik ayrilir.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <p className="text-slate-600 dark:text-slate-300">Mesajlasma, destek ve takip islemleri merkezi yapida calisir.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4 flex items-center gap-3">
              <Clock3 className="h-4 w-4 text-slate-500" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Son senkronizasyon: sistem verileri otomatik olarak guncel tutulur.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Okul Duyurulari</h4>
              <div className="mt-2 space-y-2">
                {announcements.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Guncel duyuru bulunmuyor.</p>
                )}
                {announcements.map((item) => (
                  <div key={item.id} className="rounded-lg bg-slate-50 dark:bg-slate-800/70 p-2.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{item.body}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(item.publishAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Son Guncellemeler</h4>
              <div className="mt-2 space-y-2">
                {updates.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Guncelleme kaydi bulunmuyor.</p>
                )}
                {updates.map((item) => (
                  <div key={item.id} className="rounded-lg bg-slate-50 dark:bg-slate-800/70 p-2.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{item.body}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(item.publishAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex-1 rounded-2xl bg-[#1e293b] text-slate-100 p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">On Giris Merkezi</p>
                <p className="mt-2 text-xl font-semibold">{schoolName || "Deneme Takip Sistemi"}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-slate-300">Sinav Modulu</p>
                  <p className="mt-1 text-white font-semibold">Aktif</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-slate-300">Rapor Merkezi</p>
                  <p className="mt-1 text-white font-semibold">Hazir</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center px-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {schoolName || "Deneme Takip"} - Tum haklari saklidir.
        </p>
      </footer>
    </div>
  );
}
