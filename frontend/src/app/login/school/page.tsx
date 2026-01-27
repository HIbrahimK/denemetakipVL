"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, School, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { setUserData } from "@/lib/auth";

export default function SchoolLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch('http://localhost:3001/auth/login-school', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                throw new Error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            }

            const data = await res.json();
            setUserData(data.user, data.access_token);

            // Redirect to dashboard (yeni tasarım)
            router.push('/dashboard');

        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-[#0f172a] font-sans">

            {/* Left Side - Visual Banner */}
            <div className="hidden lg:flex w-1/2 relative bg-[#1e1e2d] items-center justify-center p-12 overflow-hidden">
                {/* Background shapes */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>

                <div className="relative z-10 max-w-lg text-white">
                    <div className="mb-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                        <School className="h-5 w-5 text-indigo-400" />
                        <span className="font-medium">Kurumsal Yönetim</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Okulunuzu Modern Teknolojiyle Yönetin.</h1>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                        Sınav analizleri, öğrenci takibi ve ayrıntılı raporlar tek bir platformda.
                        Yönetici panelinize giriş yaparak okulunuzun tam kontrolünü sağlayın.
                    </p>

                    {/* Stats Preview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <h3 className="text-3xl font-bold mb-1">24+</h3>
                            <p className="text-sm text-slate-400">Analiz Aracı</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <h3 className="text-3xl font-bold mb-1">%100</h3>
                            <p className="text-sm text-slate-400">Veri Güvenliği</p>
                        </div>
                    </div>
                </div>

                {/* Floating Elements (Visual Decoration) */}
                <div className="absolute bottom-10 right-10 text-slate-600 text-sm">
                    © 2026 Deneme Takip
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
                <div className="absolute top-6 right-6 lg:top-12 lg:right-12">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Anasayfaya Dön
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Tekrar Hoşgeldiniz</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Hesabınıza erişmek için bilgilerinizi girin.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-800 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Adresi</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="yonetici@okul.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-12 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Şifre</Label>
                                    <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                        Şifremi Unuttum?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-12 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                            <label
                                htmlFor="remember"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-500 dark:text-slate-400"
                            >
                                Beni hatırla
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                        Hesabınız yok mu?{' '}
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                            Bize Ulaşın
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
