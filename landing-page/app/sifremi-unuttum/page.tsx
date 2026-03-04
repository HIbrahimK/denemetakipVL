"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  Mail,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { API_URL } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Bir hata oluştu");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold">Deneme Takip</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Şifremi Unuttum
            </CardTitle>
            <p className="text-center text-muted-foreground text-sm">
              {sent
                ? "E-posta adresinize sıfırlama bağlantısı gönderildi"
                : "E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim"}
            </p>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="inline-flex p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>{email}</strong> adresine şifre sıfırlama
                  bağlantısı gönderildi. Lütfen e-postanızı kontrol edin.
                </p>
                <p className="text-xs text-muted-foreground">
                  E-posta gelmediyse spam klasörünüzü kontrol edin.
                </p>
                <Link
                  href="/giris"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Giriş sayfasına dön
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Adresi</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-2 border rounded-md"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Gönderiliyor...
                    </>
                  ) : (
                    "Sıfırlama Bağlantısı Gönder"
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/giris"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Giriş sayfasına dön
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} Deneme Takip. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
