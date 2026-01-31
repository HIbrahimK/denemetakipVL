"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle, Users } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { setUserData } from "@/lib/auth";
import SchoolLogo from "@/components/school-logo";

export default function ParentLoginPage() {
    const router = useRouter();
    const [studentNumber, setStudentNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch('http://localhost:4000/auth/login-parent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentNumber, password }),
            });

            if (!res.ok) {
                throw new Error('Giriş başarısız. Bilgilerinizi kontrol edin.');
            }

            const data = await res.json();
            setUserData(data.user, data.access_token);

            // Redirect parent to child's results page
            router.push('/dashboard/parent/results');
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-[#0f172a] font-sans">

            {/* Visual Banner - Amber Theme */}
            <div className="hidden lg:flex w-1/2 relative bg-[#78350f] items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>

                <div className="relative z-10 max-w-lg text-white">
                    <div className="mb-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                        <Users className="h-5 w-5 text-amber-300" />
                        <span className="font-medium text-amber-100">Veli Bilgilendirme Sistemi</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Çocuğunuzun Geleceğine Ortak Olun.</h1>
                    <p className="text-lg text-amber-100/80 mb-8 leading-relaxed">
                        Akademik durumunu, deneme analizlerini ve gelişimini yakından takip edin.
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
                <div className="absolute top-6 right-6 lg:top-12 lg:right-12">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md space-y-6">
                    {/* School Logo and Name */}
                    <div className="flex flex-col items-center text-center pb-4">
                        <SchoolLogo className="h-20 w-20" showName={true} nameClassName="text-2xl font-bold text-slate-900 dark:text-white mt-4" />
                    </div>

                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-amber-600 transition-colors mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Anasayfaya Dön
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Veli Girişi</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Öğrencinin okul numarası ve şifrenizle giriş yapın.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-800 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="studentNumber" className="text-slate-700 dark:text-slate-300">Öğrenci Numarası</Label>
                                <Input
                                    id="studentNumber"
                                    placeholder="Örn: 2024001"
                                    value={studentNumber}
                                    onChange={(e) => setStudentNumber(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-12 rounded-xl focus:ring-amber-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Şifre</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-12 rounded-xl focus:ring-amber-500"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02]"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
