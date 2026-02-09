import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Target,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Önerileri</h1>
        <p className="text-muted-foreground mt-1">
          Performans analizine dayalý kiþiselleþtirilmiþ öneriler
        </p>
      </div>

      {/* Genel Durum */}
      <Card>
        <CardHeader>
          <CardTitle>Genel Performans Analizi</CardTitle>
          <CardDescription>Son 30 günlük performansýn özeti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium">Güçlü Yanlar</span>
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Matematik performansý yükseliyor
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Düzenli çalýþma alýþkanlýðý
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Hedeflere ulaþma oraný yüksek
                </li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Geliþim Alanlarý</span>
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Fizik konularýna odaklan
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Çalýþma süresini artýr
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Organik kimya eksiklikleri
                </li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="font-medium">Acil Müdahale</span>
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Türkçe netleri düþüyor
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  3 gecikmiþ görev var
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Haftalýk hedef geride
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detaylý Öneriler */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Matematik Önerisi */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle>Matematik - Devam Et!</CardTitle>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Öncelik: Orta
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Son 3 denemenin matematik net ortalamasý <strong>%15 arttý</strong>. Bu harika bir geliþim!
              Momentum kaybetme, fonksiyonlar ve türev konularýna devam et.
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">Önerilen Kaynaklar:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Limit Yayýnlarý - Fonksiyonlar Test Kitabý
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Endemik Yayýnlarý - Türev Soru Bankasý
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Matematik Çalýþma Planý Oluþtur
            </Button>
          </CardContent>
        </Card>

        {/* Fizik Önerisi */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle>Fizik - Odaklan</CardTitle>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                Öncelik: Yüksek
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Elektrik konusunda netlerini artýrman gerekiyor. Son 2 denemede <strong>elektrik sorularýnda %40 baþarý</strong> gösterdin.
              Bu konuya günde en az 30 dakika ayýr.
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">Önerilen Çalýþma Planý:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Elektrik akýmý - Temel kavramlar (2 gün)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Direnç ve Ohm Kanunu (3 gün)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Karma problemler (2 gün)
                </li>
              </ul>
            </div>

            <Button className="w-full">
              <ArrowRight className="mr-2 h-4 w-4" />
              Fizik Özel Plan Baþlat
            </Button>
          </CardContent>
        </Card>

        {/* Türkçe Önerisi */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <CardTitle>Türkçe - Acil Ýyileþtir</CardTitle>
              </div>
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                Öncelik: Çok Yüksek
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Son 3 denemede Türkçe netlerin <strong>%20 düþtü</strong>. Özellikle sözcükte anlam ve paragraf konularýnda
              zorluk yaþýyorsun. Bu durumu tersine çevirmeliyiz!
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">Acil Aksiyonlar:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Günde 20 paragraf soru çöz
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Sözcük çalýþmasýna her gün 15 dakika ayýr
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Haftada 2 deneme yap
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="destructive">
              <ArrowRight className="mr-2 h-4 w-4" />
              Türkçe Yoðunlaþtýrýlmýþ Program Baþlat
            </Button>
          </CardContent>
        </Card>

        {/* Genel Çalýþma Önerisi */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <CardTitle>Çalýþma Alýþkanlýklarý</CardTitle>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Öncelik: Orta
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              7 günlük çalýþma serine sahipsin, harika! Ancak günlük ortalama çalýþma süren <strong>2.5 saat</strong>.
              Hedefinize ulaþmak için <strong>4 saate</strong> çýkarman gerekiyor.
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">Öneriler:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Pomodoro tekniði kullan (25 dk çalýþ, 5 dk mola)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Sabah 07:00-09:00 arasý verimli olduðunu keþfettik
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Grup çalýþmasý motivasyonunu artýrýyor
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Çalýþma Rutini Optimize Et
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
