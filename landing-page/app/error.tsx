"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 bg-red-100 rounded-full mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Bir Hata Oluştu</h1>
        <p className="text-muted-foreground mb-8">
          Beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyin.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
