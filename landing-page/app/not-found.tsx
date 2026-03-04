import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4">Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/iletisim"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            İletişim
          </Link>
        </div>
      </div>
    </div>
  );
}
