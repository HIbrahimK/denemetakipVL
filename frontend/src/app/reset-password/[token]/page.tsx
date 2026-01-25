"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [verifying, setVerifying] = useState(true);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Validate token on mount
        fetch(`http://localhost:3001/auth/validate-reset-token/${resolvedParams.token}`)
            .then(res => {
                if (res.ok) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                }
            })
            .catch(() => setTokenValid(false))
            .finally(() => setVerifying(false));
    }, [resolvedParams.token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor");
            return;
        }

        if (password.length < 4) {
            setError("Şifre en az 4 karakter olmalıdır");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch('http://localhost:3001/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: resolvedParams.token,
                    newPassword: password
                }),
            });

            if (!res.ok) {
                throw new Error('Şifre sıfırlama başarısız oldu.');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/login/school');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <p className="text-slate-500">Token kontrol ediliyor...</p>
            </div>
        );
    }

    if (tokenValid === false) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-2 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-4">
                            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-2xl text-red-700 dark:text-red-400">Geçersiz Link</CardTitle>
                        <CardDescription className="text-red-600 dark:text-red-300">
                            Bu şifre sıfırlama linki geçersiz veya süresi dolmuş.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-red-600 hover:bg-red-700" variant="default">
                            <Link href="/forgot-password">
                                Yeni Link Gönder
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">Şifre Sıfırlandı</CardTitle>
                        <CardDescription className="text-emerald-600 dark:text-emerald-300">
                            Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="border-2 dark:bg-slate-900/50 dark:border-slate-800">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                            <Lock className="h-8 w-8 text-indigo-600" />
                        </div>
                        <CardTitle className="text-2xl">Yeni Şifre Belirle</CardTitle>
                        <CardDescription>
                            Güçlü bir şifre seçin
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">Yeni Şifre</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="En az 4 karakter"
                                    className="dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Şifreyi tekrar girin"
                                    className="dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                disabled={loading}
                            >
                                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
