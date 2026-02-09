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
          Performans analizine dayalı kişiselleştirilmiş öneriler
        </p>
      </div>

      {/* Genel Durum */}
      <Card>
        <CardHeader>
          <CardTitle>Genel Performans Analizi</CardTitle>
          <CardDescription>Son 30 günlük performansın özeti</CardDescription>
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
                  Matematik performansı yükseliyor
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Düzenli çalışma alışkanlığı
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Hedeflere ulaşma oranı yüksek
                </li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Gelişim Alanları</span>
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Fizik konularına odaklan
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Çalışma süresini artır
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
                  Türkçe netleri düşüyor
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  3 gecikmiş görev var
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Haftalık hedef geride
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detaylı Öneriler */}
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
              Son 3 denemenin matematik net ortalaması <strong>%15 arttı</strong>. Bu harika bir gelişim!
              Momentum kaybetme, fonksiyonlar ve türev konularına devam et.
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">Önerilen Kaynaklar:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Limit Yayınları - Fonksiyonlar Test Kitabı
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Endemik Yayınları - Türev Soru Bankası
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Matematik Çalışma Planı Oluştur
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
              Elektrik konusunda netlerini artırman gerekiyor. Son 2 denemede <strong>elektrik sorularında %40 başarı</strong> gösterdin.
              Bu konuya günde en az 30 dakika ayır.
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">Önerilen Çalışma Planı:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Elektrik akımı - Temel kavramlar (2 gün)
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
              Fizik Özel Plan Başlat
            </Button>
          </CardContent>
        </Card>

        {/* Türkçe Önerisi */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <CardTitle>Türkçe - Acil İyileştir</CardTitle>
              </div>
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                Öncelik: Çok Yüksek
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Son 3 denemede Türkçe netlerin <strong>%20 düştü</strong>. Özellikle sözcükte anlam ve paragraf konularında
              zorluk yaşıyorsun. Bu durumu tersine çevirmeliyiz!
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
                  Sözcük çalışmasına her gün 15 dakika ayır
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Haftada 2 deneme yap
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="destructive">
              <ArrowRight className="mr-2 h-4 w-4" />
              Türkçe Yoğunlaştırılmış Program Başlat
            </Button>
          </CardContent>
        </Card>

        {/* Genel Çalışma Önerisi */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <CardTitle>Çalışma Alışkanlıkları</CardTitle>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Öncelik: Orta
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              7 günlük çalışma serine sahipsin, harika! Ancak günlük ortalama çalışma süren <strong>2.5 saat</strong>.
              Hedefinize ulaşmak için <strong>4 saate</strong> çıkarman gerekiyor.
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">Öneriler:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Pomodoro tekniği kullan (25 dk çalış, 5 dk mola)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Sabah 07:00-09:00 arası verimli olduğunu keşfettik
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Grup çalışması motivasyonunu artırıyor
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Çalışma Rutini Optimize Et
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
